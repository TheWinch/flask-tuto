from app import db, models
from . import api
from flask_restplus import Resource, fields, reqparse
from sqlalchemy import or_

ns = api.namespace('customers', description='Customers operations')

customer_model = api.model('Customer', {
    'id': fields.Integer(readOnly=True),
    'firstName': fields.String(attribute='firstname'),
    'lastName': fields.String(attribute='lastname'),
    'email': fields.String,
    'phone': fields.String,
    'uri': fields.Url('api.customer_ep')
})

class CustomerDAO(object):
    def get(self, id):
        return models.Customer.query.get(id)

    def getAll(self):
        return models.Customer.query.all()
        
    def getByNameOrEmail(self, pattern):
        q = models.Customer.query
        p=str(pattern[0])
        print(p)
        return q.filter(or_(models.Customer.firstname.like('%'+p+'%'), models.Customer.lastname.like('%'+p+'%'), models.Customer.email.like('%'+p+'%'))).all()

DAO = CustomerDAO()

@ns.route('','/')
class CustomerList(Resource):
    @ns.marshal_list_with(customer_model)
    def get(self):
        '''Get the list of all customers, possibly filtered by name'''
        parser = reqparse.RequestParser()
        parser.add_argument('name', action='append')
        args = parser.parse_args()
        if args['name'] is not None:
            return DAO.getByNameOrEmail(args['name']), 200, {'Access-Control-Allow-Origin':'*'}
        return DAO.getAll(), 200, {'Access-Control-Allow-Origin':'*'}

@ns.route('/<int:id>', endpoint='customer_ep')
@ns.response(404, 'Customer not found')
@ns.param('id', 'The customer identifier')
class Customer(Resource):
    @ns.marshal_with(customer_model)
    def get(self, id):
        '''Get a particular customer'''
        return DAO.get(id), 200, {'Access-Control-Allow-Origin':'*'}
