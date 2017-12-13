#!flask/bin/python
import datetime
import imp
import os.path
import sys

from migrate.versioning import api

from app import models
from app.factory import create_app, db

app = create_app()
app.app_context().push()


def create_db(migration_repo, db_uri):
    db.create_all()
    if not os.path.exists(migration_repo):
        api.create(migration_repo, 'database repository')
        api.version_control(db_uri, migration_repo)
    else:
        api.version_control(db_uri, migration_repo, api.version(migration_repo))


def migrate_db(migration_repo, db_uri):
    # Get the latest version available in the repository
    v = api.db_version(db_uri, migration_repo)
    migration = migration_repo + ('/versions/%03d_migration.py' % (v + 1))

    tmp_module = imp.new_module('old_model')
    old_model = api.create_model(db_uri, migration_repo)
    exec (old_model, tmp_module.__dict__)
    script = api.make_update_script_for_model(db_uri, migration_repo, tmp_module.meta,
                                              db.metadata)
    open(migration, "wt").write(script)
    api.upgrade(db_uri, migration_repo)
    v = api.db_version(db_uri, migration_repo)

    print('New migration saved as ' + migration)
    print('Current database version: ' + str(v))


def downgrade_db(migration_repo, db_uri):
    v = api.db_version(db_uri, migration_repo)
    api.downgrade(db_uri, migration_repo, v - 1)
    v = api.db_version(db_uri, migration_repo)
    print('Current database version: ' + str(v))


def upgrade_db(migration_repo, db_uri):
    api.upgrade(db_uri, migration_repo)
    v = api.db_version(db_uri, migration_repo)
    print('Current database version: ' + str(v))


def populate_db():
    """Populates database with sample data"""
    vgr = models.Customer(firstname='Vincent', lastname='Girard-Reydet', phone='06.13.283.283',
                          email='vincent;girardreydet@gmail.com')
    sd = models.Customer(firstname='Sara', lastname='Doukkali', phone='06.09.40.61.44', email='sara_doukkali@yahoo.fr')
    ts1 = models.TimeSlot(start=datetime.datetime(2016, 8, 1, 8, 45), duration=7200, trainers='JP,Florent', capacity=8,
                          free_capacity=8)
    ts2 = models.TimeSlot(start=datetime.datetime(2016, 8, 1, 11, 55), duration=7200, trainers='JP', capacity=4,
                          free_capacity=4)
    ts3 = models.TimeSlot(start=datetime.datetime(2016, 8, 1, 14, 30), duration=7200, trainers='JP,Florent', capacity=8,
                          free_capacity=8)
    ts4 = models.TimeSlot(start=datetime.datetime(2016, 8, 1, 17, 00), duration=7200, trainers='JP,Florent', capacity=8,
                          free_capacity=8)
    vgr.create()
    sd.create()
    ts1.create()
    ts2.create()
    ts3.create()
    ts4.create()

    o1 = models.Order(payer=vgr, title='vgr: Sample order')
    o1.create()

    a1 = models.Appointment(customer=vgr, order=o1, timeslot=ts1)
    a2 = models.Appointment(customer=vgr, order=o1, timeslot=ts2)
    a1.create()
    a2.create()


def main():
    app = create_app()
    migration_repo = app.config['SQLALCHEMY_MIGRATE_REPO']
    db_uri = app.config['SQLALCHEMY_DATABASE_URI']
    app.app_context().push()
    args = sys.argv[1:]

    if args[0] == 'create':
        create_db(migration_repo, db_uri)
    elif args[0] == 'migrate':
        migrate_db(migration_repo, db_uri)
    elif args[0] == 'populate':
        populate_db()


if __name__ == '__main__':
    main()
