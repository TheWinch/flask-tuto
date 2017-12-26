from flask_restplus import Resource, fields, reqparse
from flask import request

from dateutil.parser import parse
from datetime import timedelta

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
        return len(fields.get_value('appointments', obj))


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

    @ns.marshal_list_with(timeslot_model, code=201)
    def post(self):
        """Create a new timeslot"""
        data = request.json
        result = []

        try:
            iterator = iter(data)
        except TypeError:
            # single element was provided
            result.append(self.create_single(data))
        else:
            for d in iterator:
                result.append(self.create_single(d))

        return result, 201

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


@ns.route('/<int:id>', endpoint='timeslot_ep')
@ns.response(404, 'Time slot not found')
@ns.param('id', 'The timeslot identifier')
class Timeslot(Resource):
    @ns.marshal_with(timeslot_model)
    def get(self, id):
        """Get a particular timeslot"""
        return models.TimeSlot.load(id)

    def delete(self, id):
        """Delete a particular timeslot"""
        models.TimeSlot.load(id).delete()
        return '', 204

    def put(self, id):
        """Updates all non-readonly fields of a timeslot"""
        data = request.json
        start = parse(data['start'])
        end = parse(data['end'])
        duration = end - start
        capacity = int(data['capacity'])
        t = models.TimeSlot.load(id)
        t.start = start
        t.duration = duration.total_seconds()
        if capacity < len(t.appointments):
            return 'Capacity must not be lower than remaining capacity', 400
        t.capacity = capacity
        t.trainers = data['trainers']
        t.update()
        return '', 204

    def patch(self, id):
        """Updates the start and end of a timeslot"""
        data = request.json
        t = models.TimeSlot.load(id)
        t.start = parse(data['start'])
        end = parse(data['end'])
        t.duration = (end - t.start).total_seconds()
        t.update()
        return '', 204

