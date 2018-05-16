# encoding: utf-8
"""
All DB models for the application.
"""
from dateutil.parser import parse
from sqlalchemy import or_, and_

from app import db


class Customer(db.Model):
    """A customer of the system. This is different from an authenticated user."""
    __tablename__ = 'customer'
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(64), index=True, unique=False, nullable=False)
    lastname = db.Column(db.String(64), index=True, unique=False, nullable=False)
    phone = db.Column(db.String(18), index=False, unique=True, nullable=True)
    email = db.Column(db.String(120), index=True, unique=False, nullable=True)
    orders = db.relationship('Order', backref='payer', lazy=True)
    appointments = db.relationship('Appointment', backref='customer', lazy=True)

    def __repr__(self):
        return '<User %r %r>' % (self.firstname, self.lastname)

    @staticmethod
    def load_all():
        return Customer.query.all()

    @staticmethod
    def load(cid):
        return Customer.query.get(cid)

    @staticmethod
    def load_by_name(pattern):
        return Customer.query.filter(or_(Customer.firstname.like('%' + pattern + '%'),
                                         Customer.lastname.like('%' + pattern + '%'),
                                         Customer.email.like('%' + pattern + '%'))).all()

    def create(self):
        db.session.add(self)
        db.session.commit()
        db.session.refresh(self, ['id'])

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class Order(db.Model):
    """An order passed by a paying customer."""
    __tablename__ = 'order'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    payer_id = db.Column(db.Integer, db.ForeignKey('customer.id'))
    appointments = db.relationship('Appointment', backref='order', lazy=False)

    def __repr__(self):
        return '<Order %d p=%d>' % (self.id, self.payer_id)

    @staticmethod
    def load_all(page=None, limit=10):
        allOrders = Order.query.all() # TODO - find how to get the count estimate
        if page is None:
            return allOrders, len(allOrders)
        else:
            start, stop = (page-1)*limit, page*limit
            return Order.query.slice(start, stop).all(), len(allOrders)

    @staticmethod
    def load_all_by_customer(searchTerm, page=None, limit=10):
        # TODO- find how to express criterion on order's customers
        query = Order.query.filter(or_(Order.appointments.customer.firstname.like('%' + searchTerm + '%'),
                                       Order.appointments.customer.lastname.like('%' + searchTerm + '%'),
                                       Order.appointments.customer.email.like('%' + searchTerm + '%')))
        if page is None:
            return query.all()
        start, stop = (page-1)*limit, page*limit
        return query.slice(start, stop).all(), 10

    @staticmethod
    def load(oid):
        return Order.query.get(oid)

    def create(self):
        db.session.add(self)
        db.session.commit()
        db.session.refresh(self, ['id'])

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class Appointment(db.Model):
    """An appointment made for a customer."""
    __tablename__ = 'appointment'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'))
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))
    timeslot_id = db.Column(db.Integer, db.ForeignKey('timeslot.id'))

    def __repr__(self):
        return '<Appointment c=%d, t=%d>' % (self.customer_id, self.timeslot_id)

    @staticmethod
    def load_all():
        return Appointment.query.all()

    @staticmethod
    def load(oid):
        return Appointment.query.get(oid)

    def create(self):
        db.session.add(self)
        db.session.commit()
        db.session.refresh(self, ['id'])

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


class TimeSlot(db.Model):
    """An available timeslot for a lesson"""
    __tablename__ = 'timeslot'
    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.DateTime, index=True, unique=True)
    duration = db.Column(db.Integer)  # in ms
    trainers = db.Column(db.String(128))
    capacity = db.Column(db.Integer)
    free_capacity = db.Column(db.Integer)  # denormalized remaining capacity
    appointments = db.relationship('Appointment', backref='timeslot', lazy=True)

    def __repr__(self):
        return '<Slot %d, date=%r, capacity=%d>' % (
            self.id, self.start.isoformat('T'), self.capacity)

    @staticmethod
    def load_all():
        return TimeSlot.query.order_by(TimeSlot.start).all()

    @staticmethod
    def load(oid):
        return TimeSlot.query.get(oid)

    @staticmethod
    def load_by_date(start, end=None):
        if end is not None:
            return TimeSlot.query.filter(
                and_(TimeSlot.start >= parse(start), TimeSlot.start <= parse(end))).order_by(
                TimeSlot.start).all()
        else:
            return TimeSlot.query.filter(TimeSlot.start >= parse(start)).order_by(
                TimeSlot.start).all()

    def create(self):
        db.session.add(self)
        db.session.commit()
        db.session.refresh(self, ['id'])

    def update(self):
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
