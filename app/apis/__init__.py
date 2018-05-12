# encoding: utf-8
"""
API façade for the project. All code that depends on Flask-RESTPlus goes here.
"""
from flask import Blueprint
from flask_restplus import Api, fields
from flask_restplus.fields import to_marshallable_type

api = Api(  # pylint: disable=invalid-name
    version='1.0', title='Schedule Mapper API',
    description='A simple API for the schedule mapper',
    doc='/doc/')


class UrlWithUid(fields.Url):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def output(self, key, obj):
        to_marshal = to_marshallable_type(obj)
        to_marshal['uid'] = obj.id
        return super().output(key, to_marshal)


def init_app(app):
    blueprint = Blueprint('api', __name__, url_prefix='/api')
    api.init_app(blueprint)
    from app.apis.customer_api import ns as customers  # pylint: disable=unused-variable
    from app.apis.order_api import ns as orders        # pylint: disable=unused-variable
    from app.apis.timeslot_api import ns as timeslots  # pylint: disable=unused-variable

    app.register_blueprint(blueprint)
