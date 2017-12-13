from flask_restplus import Resource, fields, reqparse
from flask import request

from app import models
from . import api

ns = api.namespace('customers', description='Customers operations')

customer_model = api.model('Customer', {
    'id': fields.Integer(readOnly=True),
    'firstName': fields.String(attribute='firstname'),
    'lastName': fields.String(attribute='lastname'),
    'email': fields.String,
    'phone': fields.String,
    'uri': fields.Url('api.customer_ep')
})


@ns.route('', '/')
class CustomerList(Resource):
    @ns.marshal_list_with(customer_model)
    def get(self):
        """Get the list of all customers, possibly filtered by name"""
        parser = reqparse.RequestParser()
        parser.add_argument('name', action='append')
        args = parser.parse_args()
        if args['name'] is not None:
            return models.Customer.load_by_name(args['name'][0]), 200, {'Access-Control-Allow-Origin': '*'}
        return models.Customer.load_all(), 200, {'Access-Control-Allow-Origin': '*'}

    @ns.marshal_with(customer_model, code=201)
    def post(self):
        """Create a new customer"""
        data = request.form
        c = models.Customer(firstname=data['firstName'], lastname=data['lastName'], email=data['email'],
                            phone=data['phone'])
        c.create()
        return c, 201, {'Access-Control-Allow-Origin': '*'}


@ns.route('/<int:id>', endpoint='customer_ep')
@ns.response(404, 'Customer not found')
@ns.param('id', 'The customer identifier')
class Customer(Resource):
    @ns.marshal_with(customer_model)
    def get(self, id):
        """Get a particular customer"""
        return models.Customer.load(id), 200, {'Access-Control-Allow-Origin': '*'}

    def delete(self, id):
        """Delete a particular customer"""
        models.Customer.load(id).delete()
        return '', 204, {'Access-Control-Allow-Origin': '*'}
