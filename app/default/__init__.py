# encoding: utf-8
"""
Fallback routes blueprint that sends to the front UI.
"""
from flask import Blueprint
from config import Config

default = Blueprint('cast', __name__, static_folder=Config.STATIC_FOLDER, static_url_path='')


def init_app(app):
    from . import routes  # pylint: disable=unused-variable
    app.register_blueprint(default)
