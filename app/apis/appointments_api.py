from flask_restplus import Resource, fields, reqparse
from flask import request, url_for

from dateutil.parser import parse

from app import models
from . import api

ns = api.namespace('appointments', description='Appointment operations')



appointment_model = api.model('Appointment', {
    'id': fields.Integer(readOnly=True),
    'start': fields.DateTime(attribute='timeslot.start'),
    'duration': fields.Integer(attribute='timeslot.duration'),
    'customer': fields.Integer(attribute='customer_id'),
    'slot': fields.Integer(attribute='timeslot_id'),
    'order': fields.Integer(attribute='order_id'),
    'uri': fields.Url('api.appointment_ep')
})


@ns.route('', '/')
class AppointmentList(Resource):
    @ns.marshal_list_with(appointment_model)
    def get(self):
        """Get the list of all appointments"""
        return models.Appointment.load_all(), 200, {'Access-Control-Allow-Origin': '*'}

    @ns.marshal_with(appointment_model, code=201)
    def post(self):
        """Create a new appointment"""
        data = request.form

        a = models.Appointment(timeslot_id=int(data['slot']), customer_id=int(data['customer']),
                               order_id=data['order'])
        a.create()
        return a, 201, {'Access-Control-Allow-Origin': '*'}


@ns.route('/<int:id>', endpoint='appointment_ep')
@ns.response(404, 'Appointment not found')
@ns.param('id', 'The appointment identifier')
class Appointment(Resource):
    @ns.marshal_with(appointment_model)
    def get(self, id):
        """Get a particular appointment"""
        return models.Appointment.load(id), 200, {'Access-Control-Allow-Origin': '*'}

    def delete(self, id):
        """Delete a particular appointment"""
        models.Appointment.load(id).delete()
        return '', 204, {'Access-Control-Allow-Origin': '*'}
