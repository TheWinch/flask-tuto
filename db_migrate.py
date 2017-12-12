#!flask/bin/python
import imp, os
from migrate.versioning import api
from config import config, SQLALCHEMY_MIGRATE_REPO
from app import create_app

a = create_app(os.getenv('FLASK_CONFIG') or 'default')
conf = config[os.getenv('FLASK_CONFIG') or 'default']

from app import db
with a.app_context():
    db.init_app(a)

    # Get the latest version available in the repository
    v = api.db_version(conf.SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    migration = SQLALCHEMY_MIGRATE_REPO + ('/versions/%03d_migration.py' % (v+1))
    tmp_module = imp.new_module('old_model')
    old_model = api.create_model(conf.SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    exec(old_model, tmp_module.__dict__)
    script = api.make_update_script_for_model(conf.SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO, tmp_module.meta, db.metadata)
    open(migration, "wt").write(script)
    api.upgrade(conf.SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    v = api.db_version(conf.SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
    print('New migration saved as ' + migration)
    print('Current database version: ' + str(v))