from flask_restplus import Resource, fields, reqparse, abort
from flask import request, url_for

from dateutil.parser import parse
from datetime import timedelta

from sqlalchemy.exc import IntegrityError

from app import models
from . import api

ns = api.namespace('timeslots', description='Time slot operations')


class DateTimeFromDuration(fields.DateTime):
    def __init__(self, duration_attribute='duration', **kwargs):
        super(DateTimeFromDuration, self).__init__(**kwargs)
        self.duration_attribute = duration_attribute

    def output(self, key, obj):
        date = fields.get_value(key if self.attribute is None else self.attribute, obj)
        duration = fields.get_value('duration' if self.duration_attribute is None else self.duration_attribute, obj)
        if date is None or duration is None:
            default = self._v('default')
            return self.format(default) if default else default

        value = date + timedelta(seconds=duration)
        try:
            data = self.format(value)
        except fields.MarshallingError as e:
            msg = 'Unable to marshal field "{0}" value "{1}": {2}'.format(key, value, str(e))
            raise fields.MarshallingError(msg)
        return self.mask.apply(data) if self.mask else data


class UsedCapacity(fields.Raw):
    def __init__(self, **kwargs):
        super(UsedCapacity, self).__init__(**kwargs)

    def output(self, key, obj):
        value = fields.get_value('appointments', obj)
        if value is None:
            value = []
        return len(value)


timeslot_model = ns.model('TimeSlot', {
    'id': fields.Integer(readOnly=True),
    'start': fields.DateTime,
    'end': DateTimeFromDuration(duration_attribute='duration', attribute='start'),
    'trainers': fields.String,
    'used': UsedCapacity(),
    'capacity': fields.Integer(attribute='free_capacity'),
    'uri': fields.Url('api.timeslot_ep')
})


@ns.route('/')
class TimeslotList(Resource):
    @ns.marshal_list_with(timeslot_model)
    def get(self):
        """Get the list of all timeslots, possibly filtered by date"""
        parser = reqparse.RequestParser()
        parser.add_argument('start')
        parser.add_argument('end')
        args = parser.parse_args()
        if args['start'] is not None:
            return models.TimeSlot.load_by_date(args['start'], args['end'])
        return models.TimeSlot.load_all()

    @ns.marshal_with(timeslot_model)
    @ns.response(409, 'Time slot cannot be created because a similar time slot already exists')
    @ns.response(201, 'Time slot has been created')
    def post(self):
        """Create a new timeslot"""
        data = request.json
        try:
            timeslot = self.create_single(data)
            return timeslot, 201, {'Location': url_for('api.timeslot_ep', id=timeslot.id)}
        except IntegrityError:
            abort(409)

    @staticmethod
    def create_single(data):
        start = parse(data['start'])
        end = parse(data['end'])
        duration = end - start
        capacity = int(data['capacity'])
        t = models.TimeSlot(start=start, duration=duration.total_seconds(), trainers=data.get('trainers', ''),
                            capacity=capacity, free_capacity=capacity)
        t.create()
        return t


@ns.route('/batch')
class TimeslotListCreateBatch(Resource):
    @ns.marshal_list_with(timeslot_model)
    @ns.response(409, 'At least 1 time slot cannot be created because a similar time slot already exists')
    @ns.response(201, 'All Time slots have been created')
    def post(self):
        """Creates a batch of timeslots in a single operation. The operation will fail if a single element in the
        batch cannot be created."""
        data = request.json
        result = []
        try:
            for t in data:
                result.append(TimeslotList.create_single(t))
        except IntegrityError:
            abort(409)
        return result, 201


@ns.route('/<int:id>', endpoint='timeslot_ep')
@ns.response(404, 'Time slot not found')
@ns.param('id', 'The timeslot identifier')
class Timeslot(Resource):
    @ns.marshal_with(timeslot_model)
    def get(self, id):
        """Get a particular timeslot"""
        loaded = models.TimeSlot.load(id)
        if loaded is None:
            abort(404)
        return loaded

    @ns.response(204, 'Time slot has been deleted')
    def delete(self, id):
        """Delete a particular timeslot"""
        loaded = models.TimeSlot.load(id)
        if loaded is None:
            return '', 404
        loaded.delete()
        return '', 204

    @ns.response(204, 'Time slot has been updated')
    def put(self, id):
        """Updates all non-readonly fields of a timeslot"""
        data = request.json
        start = parse(data['start'])
        end = parse(data['end'])
        duration = end - start
        capacity = int(data['capacity'])
        t = models.TimeSlot.load(id)
        if t is None:
            return '', 404
        t.start = start
        t.duration = duration.total_seconds()
        if capacity < len(t.appointments):
            return 'Capacity must not be lower than remaining capacity', 400
        t.capacity = capacity
        t.trainers = data['trainers']
        t.update()
        return '', 204

    @ns.response(204, 'Time slot has been updated')
    def patch(self, id):
        """Updates the start and end of a timeslot"""
        data = request.json
        t = models.TimeSlot.load(id)
        if t is None:
            return '', 404
        t.start = parse(data['start'])
        end = parse(data['end'])
        t.duration = (end - t.start).total_seconds()
        t.update()
        return '', 204

