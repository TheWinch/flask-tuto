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
    config_name = cfg or os.getenv('FLASK_CONFIG') or 'default'
    app.config.from_object(config[config_name])
    db.init_app(app)

    from app.apis import init_app as init_api
    from app.default import init_app as init_default

    init_api(app)
    init_default(app)

    return app
