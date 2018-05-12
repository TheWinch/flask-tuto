#!flask/bin/python
import datetime
import os

from app import db, models
from app.factory import create_app
from flask_migrate import Migrate

app = create_app(os.getenv('FLASK_CONFIG') or 'default')
migrate = Migrate(app, db)


@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'models': models}


@app.cli.command()
def populate_samples():
    """Creates default content in the database"""
    vgr = models.Customer(firstname='Vincent', lastname='Girard-Reydet', phone='06.13.283.000',
                          email='vincent;girardreydet___@gmail___.com')
    sd = models.Customer(firstname='Sara', lastname='Doukkali', phone='06.09.40.00.00', email='sara_doukkali___@yahoo___.fr')
    ts1 = models.TimeSlot(start=datetime.datetime(2017, 12, 1, 8, 45), duration=7200, trainers='JP,Germain', capacity=8,
                          free_capacity=8)
    ts2 = models.TimeSlot(start=datetime.datetime(2017, 12, 1, 11, 55), duration=7200, trainers='JP', capacity=4,
                          free_capacity=4)
    ts3 = models.TimeSlot(start=datetime.datetime(2017, 12, 1, 14, 30), duration=7200, trainers='JP,Germain', capacity=8,
                          free_capacity=8)
    ts4 = models.TimeSlot(start=datetime.datetime(2017, 12, 1, 17, 00), duration=7200, trainers='JP,Germain', capacity=8,
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


@app.cli.command()
def routes():
    import pprint
    pprint.pprint(list(map(lambda x: repr(x), app.url_map.iter_rules())))


if __name__ == "__main__":
    app.run(debug=True)
