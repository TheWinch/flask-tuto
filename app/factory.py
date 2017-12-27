# -*- coding: utf-8 -*-
"""
    OSC Schedule Manager
    ~~~~~~
    A schedule management application written with Flask and sqlalchemy.
    :copyright: (c) 2017 Vincent Girard-Reydet.
    :license: BSD, see LICENSE for more details.
"""

import os
from flask import Flask
from . import db


def create_app(cfg=None):
    app = Flask('osc')
    from config import config
    config_name = os.getenv('FLASK_CONFIG') or 'default'
    app.config.from_object(config[config_name])
    db.init_app(app)

    register_blueprints(app)

    return app


def register_blueprints(app):
    from .default import default as default_blueprint
    app.register_blueprint(default_blueprint)
    from .apis import api_blueprint
    app.register_blueprint(api_blueprint)
    return None


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
