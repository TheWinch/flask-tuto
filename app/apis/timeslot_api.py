from flask_restplus import Resource, fields, reqparse
from flask import request

from dateutil.parser import parse

from app import models
from . import api

ns = api.namespace('timeslots', description='Time slot operations')

timeslot_model = api.model('TimeSlot', {
    'id': fields.Integer(readOnly=True),
    'start': fields.DateTime,
    'duration': fields.Integer,
    'trainers': fields.String,
    'capacity': fields.Integer,
    'uri': fields.Url('api.timeslot_ep')
})


@ns.route('', '/')
class TimeslotList(Resource):
    @ns.marshal_list_with(timeslot_model)
    def get(self):
        """Get the list of all timeslots"""
        return models.TimeSlot.load_all(), 200, {'Access-Control-Allow-Origin': '*'}

    @ns.marshal_with(timeslot_model, code=201)
    def post(self):
        """Create a new timeslot"""
        data = request.form

        start = parse(data['start'])
        capacity = int(data['capacity'])
        t = models.TimeSlot(start=start, duration=int(data['duration']), trainers=data['trainers'],
                            capacity=capacity, free_capacity=capacity)
        t.create()
        return t, 201, {'Access-Control-Allow-Origin': '*'}


@ns.route('/<int:id>', endpoint='timeslot_ep')
@ns.response(404, 'Time slot not found')
@ns.param('id', 'The timeslot identifier')
class Timeslot(Resource):
    @ns.marshal_with(timeslot_model)
    def get(self, id):
        """Get a particular timeslot"""
        return models.TimeSlot.load(id), 200, {'Access-Control-Allow-Origin': '*'}

    def delete(self, id):
        """Delete a particular timeslot"""
        models.TimeSlot.load(id).delete()
        return '', 204, {'Access-Control-Allow-Origin': '*'}
