# encoding: utf-8
"""
All operations to manage the customers.
"""
from flask import request, url_for
from flask_restplus import Resource, fields, reqparse, abort
from sqlalchemy.exc import IntegrityError

from app import models, db
from app.apis import api, UrlWithUid, make_paged_search_parser

ns = api.namespace('customers', description='Customers operations')


customer_model = ns.model('Customer', {
    'id': fields.Integer(readOnly=True),
    'firstName': fields.String(attribute='firstname'),
    'lastName': fields.String(attribute='lastname'),
    'email': fields.String,
    'phone': fields.String,
    'uri': UrlWithUid('api.customer_ep')
})

customer_list_model = ns.model('CustomerList', {
    'totalCount': fields.Integer(attribute='total_count'),
    'customers': fields.List(fields.Nested(customer_model))
})


class SearchResult:
    def __init__(self, total_count, customers):
        self.total_count = total_count
        self.customers = customers


@ns.route('/')
class CustomerList(Resource):
    """
    Operations related to the list of customers.
    """

    @ns.marshal_list_with(customer_list_model)
    @ns.expect(make_paged_search_parser())
    def get(self):
        """Get the list of all customers, possibly filtered by name"""
        parser = make_paged_search_parser()
        args = parser.parse_args()
        if args['limit'] is None:
            limit = 4
        else:
            limit = args['limit']
        if args['name'] is not None:
            customers, total_count = models.Customer.load_by_name(args['name'], args['page'], limit)
        else:
            customers, total_count = models.Customer.load_all(args['page'], limit)
        return SearchResult(total_count, customers)

    @ns.response(201, 'Customer created')
    @ns.response(409, 'A customer with same email already exists')
    @ns.marshal_with(customer_model)
    def post(self):
        """Create a new customer"""
        data = request.get_json()
        c = models.Customer(firstname=data['firstName'], lastname=data['lastName'],
                            email=data['email'], phone=data['phone'])
        try:
            c.create()
        except IntegrityError:
            abort(409)
        return c, 201, {'Location': url_for('api.customer_ep', _external=False, uid=c.id)}


@ns.route('/<int:uid>', endpoint='customer_ep')
@ns.param('uid', 'The customer identifier')
@ns.response(404, 'Customer not found')
class Customer(Resource):
    """
    Manages a single customer resource.
    """

    @ns.marshal_with(customer_model)
    def get(self, uid):
        """Get a particular customer"""
        loaded = models.Customer.load(uid)
        if loaded is None:
            return abort(404)
        return loaded

    @ns.response(204, 'Customer has been deleted')
    def delete(self, uid):
        """Delete a particular customer"""
        loaded = models.Customer.load(uid)
        if loaded is None:
            return '', 404
        models.Appointment.delete_by_customer(uid)
        orders = models.Order.load_by_contact(uid)
        for order in orders:
            if len(order.appointments) == 0:
                order.delete()
            else:
                if order.payer_id == uid:
                    order.payer_id = order.appointments[0].customer_id
        db.session.delete(loaded)
        db.session.commit()
        return '', 204

    @ns.response(200, 'Customer updated')
    @ns.marshal_with(customer_model, code=200)
    def put(self, uid):
        """Replaces the customer with a new definition"""
        customer = models.Customer.load(uid)
        if customer is None:
            return abort(404)
        data = request.json
        customer.firstname = data['firstName']
        customer.lastname = data['lastName']
        customer.email = data['email']
        customer.phone = data['phone']
        customer.update()
        return customer
