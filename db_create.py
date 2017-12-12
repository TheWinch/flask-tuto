#!flask/bin/python
from migrate.versioning import api
from config import config, SQLALCHEMY_MIGRATE_REPO
from app import create_app, db
import os.path

a = create_app(os.getenv('FLASK_CONFIG') or 'default')
conf = config[os.getenv('FLASK_CONFIG') or 'default']

from app import db
with a.app_context():
    db.init_app(a)
    db.create_all()
    if not os.path.exists(SQLALCHEMY_MIGRATE_REPO):
        api.create(SQLALCHEMY_MIGRATE_REPO, 'database repository')
        api.version_control(conf.SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    else:
        api.version_control(conf.SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO, api.version(SQLALCHEMY_MIGRATE_REPO))