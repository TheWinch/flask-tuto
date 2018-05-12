# encoding: utf-8
"""
All operations to manage the orders.
"""
from flask import request
from flask_restplus import Resource, fields

from app import models, db
from app.apis import api, UrlWithUid

ns = api.namespace('orders', description='Orders operations')


class FirstAndLastName(fields.Raw):
    """
    Extracts the first name and last name from the field given as attribute
    """
    def __init__(self, **kwargs):
        super(FirstAndLastName, self).__init__(**kwargs)

    def output(self, key, obj):
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


@ns.route('/')
class OrderList(Resource):
    """
    Operations related to the list of orders.
    """
    @ns.marshal_list_with(order_model)
    def get(self):
        """Get the list of all orders"""
        return models.Order.load_all()

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
        return models.Order.load(uid)

    def delete(self, uid):
        """Delete a particular order"""
        models.Order.load(uid).delete()
        return '', 204

    def put(self, uid):
        """Replaces the order with a new definition"""

        # TODO:
        # go through all existing appointments and find those deleted, delete them
        # go through all new appointments and find those without id, create them
        return 'Not implemented', 400
