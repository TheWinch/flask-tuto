from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restplus import Api

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
api = Api(app, version='1.0', title='Schedule Mapper API',
    description='A simple API for the schedule mapper',
    prefix='/api')

from app import views, models, customer_api