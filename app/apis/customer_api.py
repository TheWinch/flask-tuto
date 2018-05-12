# encoding: utf-8
"""
All operations to manage the customers.
"""
from flask import request, url_for
from flask_restplus import Resource, fields, reqparse, abort
from sqlalchemy.exc import IntegrityError

from app import models
from app.apis import api, UrlWithUid

ns = api.namespace('customers', description='Customers operations')



customer_model = ns.model('Customer', {
    'id': fields.Integer(readOnly=True),
    'firstName': fields.String(attribute='firstname'),
    'lastName': fields.String(attribute='lastname'),
    'email': fields.String,
    'phone': fields.String,
    'uri': UrlWithUid('api.customer_ep')
})


@ns.route('/')
class CustomerList(Resource):
    """
    Operations related to the list of customers.
    """

    @ns.marshal_list_with(customer_model)
    def get(self):
        """Get the list of all customers, possibly filtered by name"""
        parser = reqparse.RequestParser()
        parser.add_argument('name')
        args = parser.parse_args()
        if args['name'] is not None:
            return models.Customer.load_by_name(args['name'])
        return models.Customer.load_all()

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
        loaded.delete()
        return '', 204
