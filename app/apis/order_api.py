# encoding: utf-8
"""
All operations to manage the orders.
"""
from flask import request
from flask_restplus import Resource, fields, reqparse, abort

from app import models, db
from app.apis import api, UrlWithUid, make_paged_search_parser

ns = api.namespace('orders', description='Orders operations')


class FirstAndLastName(fields.Raw):
    """
    Extracts the first name and last name from the field given as attribute
    """

    def __init__(self, **kwargs):
        super(FirstAndLastName, self).__init__(**kwargs)

    def output(self, key, obj, **kwargs):
        actual_key = key if self.attribute is None else self.attribute
        firstname = fields.get_value(actual_key + '.firstname', obj)
        lastname = fields.get_value(actual_key + '.lastname', obj)
        value = None if firstname is None else firstname + ' ' + lastname

        if value is None:
            default = self._v('default')
            return self.format(default) if default else default

        try:
            data = self.format(value)
        except fields.MarshallingError as event:
            msg = 'Unable to marshal field "{0}" value "{1}": {2}'.format(key, value, str(event))
            raise fields.MarshallingError(msg)
        return self.mask.apply(data) if self.mask else data


appointment_model = ns.model('Appointment', {
    'id': fields.Integer(readOnly=True),
    'start': fields.DateTime(attribute='timeslot.start'),
    'customerId': fields.Integer(attribute='customer_id'),
    'slotId': fields.Integer(attribute='timeslot_id'),
    'orderId': fields.Integer(attribute='order_id'),
})

order_model = ns.model('Order', {
    'id': fields.Integer(readOnly=True),
    'contact': FirstAndLastName(attribute='payer'),
    'contactId': fields.Integer(attribute='payer_id'),
    'title': fields.String,
    'appointments': fields.List(fields.Nested(appointment_model)),
    'uri': UrlWithUid('api.order_ep')
})

order_list_model = ns.model('OrderList', {
    'totalCount': fields.Integer(attribute='total_count'),
    'orders': fields.List(fields.Nested(order_model))
})


class SearchResult:
    def __init__(self, total_count, orders):
        self.total_count = total_count
        self.orders = orders


def make_search_parser():
    parser = make_paged_search_parser()
    parser.add_argument('customerId', type=int, required=False)
    return parser

@ns.route('/')
class OrderList(Resource):
    """
    Operations related to the list of orders.
    """

    @ns.marshal_with(order_list_model)
    @ns.expect(make_search_parser())
    def get(self):
        """Get the list of all orders"""
        parser = make_search_parser()
        args = parser.parse_args()
        if args['customerId'] is not None:
            orders, total_count = models.Order.load_all_by_customer(args['customerId'])
            return SearchResult(total_count, orders)

        if args['limit'] is None:
            limit = 4
        else:
            limit = args['limit']
        if args['name'] is not None:
            orders, total_count = models.Order.load_all_matching(args['name'], args['page'], limit)
        else:
            orders, total_count = models.Order.load_all(args['page'], limit)
        return SearchResult(total_count, orders)

    @ns.marshal_with(order_model, code=201)
    @ns.header('Content-Type', 'MUST be application/json', required=True)
    def post(self):
        """Create a new order"""
        data = request.json
        order = models.Order(title=data['title'], payer_id=data['contactId'])
        db.session.add(order)
        for appointment in data['appointments']:
            app = models.Appointment(customer_id=appointment['customerId'], order_id=order.id,
                                     timeslot_id=appointment['slotId'])
            app.order = order
            db.session.add(app)
        db.session.commit()
        db.session.refresh(order, ['id'])
        return order, 201


class WrappedAppointment(object):
    def __init__(self, appointment):
        self.appointment = appointment

    def __eq__(self, other):
        return self.appointment.customer_id == other.appointment.customer_id and self.appointment.timeslot_id == other.appointment.timeslot_id

    def __hash__(self):
        return hash((self.appointment.customer_id, self.appointment.timeslot_id))


@ns.route('/<int:uid>', endpoint='order_ep')
@ns.response(404, 'Order not found')
@ns.param('uid', 'The order identifier')
class Order(Resource):
    """
    Operations related to managing a single order.
    """

    @ns.marshal_with(order_model)
    def get(self, uid):
        """Get a particular order"""
        order = models.Order.load(uid)
        if order is None:
            return abort(404)
        return order

    def delete(self, uid):
        """Delete a particular order"""
        models.Order.load(uid).delete()
        return '', 204

    @ns.marshal_with(order_model, code=200)
    @ns.header('Content-Type', 'MUST be application/json', required=True)
    def put(self, uid):
        """Replaces the order with a new definition"""
        order = models.Order.load(uid)
        if order is None:
            return abort(404)
        data = request.json
        appointments = set(WrappedAppointment(
            models.Appointment(customer_id=appointment['customerId'], order_id=order.id,
                               timeslot_id=appointment['slotId']))
                           for appointment in data['appointments'])
        original_appointments = set(WrappedAppointment(a) for a in order.appointments)

        removed = original_appointments - appointments
        added = appointments - original_appointments
        order.payer_id = data['contactId']
        order.title = data['title']

        for a in removed:
            order.appointments.remove(a.appointment)
            db.session.delete(a.appointment)
        for a in added:
            a.appointment.order = order
            db.session.add(a.appointment)
            order.appointments.append(a.appointment)
        db.session.commit()

        return order
