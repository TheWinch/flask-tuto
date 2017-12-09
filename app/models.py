from app import db

class Customer(db.Model):
    '''A customer of the system'''
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(64), index=True, unique=False)
    lastname = db.Column(db.String(64), index=True, unique=False)
    phone = db.Column(db.String(18), index=False, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    orders = db.relationship('Order', backref='customer', lazy=True)

    def __repr__(self):
        return '<User %r %r>' % (self.firstname, self.lastname)

orders_to_slots_table = db.Table('orders_to_slots', db.Model.metadata,
    db.Column('order_id', db.Integer, db.ForeignKey('order.id')),
    db.Column('timeslot_id', db.Integer, db.ForeignKey('timeslot.id'))
)

class Order(db.Model):
    '''An order passed by a customer.'''
    __tablename__ = 'order'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'))
    # TODO - allow different payer than customer
    slots = db.relationship('TimeSlot', secondary=orders_to_slots_table)

    def __repr__(self):
        return '<Order %r>'

class TimeSlot(db.Model):
    '''An available timeslot for a lesson'''
    __tablename__ = 'timeslot'
    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.DateTime, index=True, unique=True)
    duration = db.Column(db.Integer)
    trainers = db.Column(db.String(128))
    capacity = db.Column(db.Integer)

    def __repr__(self):
        return 'Slot< %d, capacity=%d>' % (self.id, self.capacity)

