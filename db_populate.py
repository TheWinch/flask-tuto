#!flask/bin/python
from app import models, create_app
import datetime, os

from config import config, SQLALCHEMY_MIGRATE_REPO

a = create_app(os.getenv('FLASK_CONFIG') or 'default')
conf = config[os.getenv('FLASK_CONFIG') or 'default']

from app import db
with a.app_context():
    db.init_app(a)

    vgr=models.Customer(firstname='Vincent',lastname='Girard-Reydet',phone='06.13.283.283',email='vincent;girardreydet@gmail.com')
    sd=models.Customer(firstname='Sara',lastname='Doukkali',phone='06.09.40.61.44',email='sara_doukkali@yahoo.fr')
    ts1=models.TimeSlot(start=datetime.datetime(2016,8,1,8,45),duration=7200,trainers='JP,Florent',capacity=8)
    ts2=models.TimeSlot(start=datetime.datetime(2016,8,1,11,55),duration=7200,trainers='JP',capacity=4)
    ts3=models.TimeSlot(start=datetime.datetime(2016,8,1,14,30),duration=7200,trainers='JP,Florent',capacity=8)
    ts4=models.TimeSlot(start=datetime.datetime(2016,8,1,17,00),duration=7200,trainers='JP,Florent',capacity=8)

    db.session.add(vgr)
    db.session.add(sd)
    db.session.add(ts1)
    db.session.add(ts2)
    db.session.add(ts3)
    db.session.add(ts4)
    db.session.commit()

    o1=models.Order(customer=vgr,slots=[ts1,ts2])
    db.session.add(o1)
    db.session.commit()