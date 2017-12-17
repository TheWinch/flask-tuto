from flask_restplus import Resource, fields, reqparse
from flask import request

from app import models
from . import api

ns = api.namespace('orders', description='Orders operations')

order_model = api.model('Order', {
    'id': fields.Integer(readOnly=True),
    'payer': fields.Integer(attribute='payer_id'),
    'title': fields.String,
    'uri': fields.Url('api.order_ep')
})


@ns.route('', '/')
class OrderList(Resource):
    @ns.marshal_list_with(order_model)
    def get(self):
        """Get the list of all orders"""
        return models.Order.load_all()

    @ns.marshal_with(order_model, code=201)
    def post(self):
        """Create a new order"""
        data = request.json
        o = models.Order(title=data['title'], payer_id=data['payer'])
        o.create()
        return o, 201


@ns.route('/<int:id>', endpoint='order_ep')
@ns.response(404, 'Order not found')
@ns.param('id', 'The order identifier')
class Order(Resource):
    @ns.marshal_with(order_model)
    def get(self, id):
        """Get a particular order"""
        return models.Order.load(id)

    def delete(self, id):
        """Delete a particular order"""
        models.Order.load(id).delete()
        return '', 204
