from flask import Flask
from config import config
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Register our blueprints
    from .default import default as default_blueprint
    app.register_blueprint(default_blueprint)
    from .apis import api_blueprint
    app.register_blueprint(api_blueprint)


    return app

from app import models
