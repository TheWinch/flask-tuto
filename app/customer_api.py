from app import api, db, models
from flask_restplus import Resource, fields
import json

ns = api.namespace('customers', description='Customers operations')

customer_model = api.model('Customer', {
    'id': fields.Integer(readOnly=True),
    'firstName': fields.String(attribute='firstname'),
    'lastName': fields.String(attribute='lastname'),
    'email': fields.String,
    'phone': fields.String,
    'uri': fields.Url('customer_ep')
})

class CustomerDAO(object):
    def get(self, id):
        return models.Customer.query.get(id)

    def getAll(self):
        return models.Customer.query.all()

DAO = CustomerDAO()

@ns.route('')
class CustomerList(Resource):
    @ns.marshal_list_with(customer_model)
    def get(self):
        '''Get the list of all customers'''
        return DAO.getAll(), 200, {'Access-Control-Allow-Origin':'*'}

@ns.route('/<int:id>', endpoint='customer_ep')
@ns.response(404, 'Customer not found')
@ns.param('id', 'The customer identifier')
class Customer(Resource):
    @ns.marshal_with(customer_model)
    def get(self, id):
        '''Get a particular customer'''
        return DAO.get(id), 200, {'Access-Control-Allow-Origin':'*'}

@api.route('/test/<int:id>')
class MyTest(Resource):
    @api.marshal_with(customer_model)
    def get(self, id):
        return DAO.get(id)


@api.route('/hello')
class HelloWorld(Resource):
    def get(self):
        return {'hello': 'world'}