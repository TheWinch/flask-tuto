from flask import Blueprint
from flask_restplus import Api

api_blueprint = Blueprint('api', __name__, url_prefix='/api')
api = Api(api_blueprint, version='1.0', title='Schedule Mapper API',
          description='A simple API for the schedule mapper',
          doc='/doc/')

from . import customer_api, timeslot_api, order_api
