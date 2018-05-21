import { OrderModel, EventFlipResult } from '../model/order.model';
import { Customer } from '../model/customer';
import { EventChoice } from '../model/customer-choices';
import { Event } from '../model/event';
import { Order } from './order';

const REFERENCE_CUSTOMER: Customer = {
  id: 1,
  firstName: 'Toto',
  lastName: 'Le Bozo',
  email: 'toto@toto.com',
  phone: '1234'
};

const ALTERNATE_CUSTOMER: Customer = {
  id: 2,
  firstName: 'Titi',
  lastName: 'Groumph',
  email: 'titi@groumph.com',
  phone: '5678'
};

const REFERENCE_EVENTS: Event[] = [
  {
    id: 1,
    title: 'Available event',
    start: new Date(),
    capacity: 2,
  },
  {
    id: 2,
    title: 'Almost full event',
    start: new Date('12/02/2018T10:00:00'),
    capacity: 1,
  },
  {
    id: 3,
    title: 'Full event',
    start: new Date('12/02/2018T08:00:00'),
    capacity: 0,
  },
];

const REFERENCE_CHOICES: EventChoice[] = [
  {
    id: 1,
    start: REFERENCE_EVENTS[0].start
  },
  {
    id: 2,
    start: REFERENCE_EVENTS[1].start
  },
];

const SAMPLE_ORDER: Order = {
  id: 123,
  title: 'Some title',
  contactId: REFERENCE_CUSTOMER.id,
  appointments: [
    {
      id: 987,
      customerId: REFERENCE_CUSTOMER.id,
      orderId: 123,
      slotId: REFERENCE_EVENTS[2].id,
      start: '12/02/2018T08:00:00'
    },
    {
      id: 1024,
      customerId: ALTERNATE_CUSTOMER.id,
      orderId: 123,
      slotId: REFERENCE_EVENTS[1].id,
      start: '12/02/2018T10:00:00'
    }
  ]
};

describe('OrderModel', () => {
  beforeEach(() => {
    this.model = new OrderModel(null, []);
  });

  it('contains nothing at creation if no order is supplied', () => {
    expect(this.model.isNewOrder()).toBeTruthy();
    expect(this.model.containsEvent(1)).toBeFalsy();
    expect(this.model.containsCustomer(REFERENCE_CUSTOMER)).toBeFalsy();
    expect(this.model.selections).toEqual([]);
    expect(this.model.currentCustomer).toBeNull();
    expect(this.model.currentCustomerEvents).toEqual([]);
  });

  it('contains customer once added', () => {
    this.model.addCustomer(REFERENCE_CUSTOMER);

    expect(this.model.containsCustomer(REFERENCE_CUSTOMER)).toBeTruthy();
    expect(this.model.currentCustomer).toBeNull();
    expect(this.model.currentCustomerEvents).toEqual([]);
  });

  it('assigns event to current customer', () => {
    this.model.addCustomer(REFERENCE_CUSTOMER);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);

    const result = this.model.flipEvent(REFERENCE_EVENTS[0]);

    expect(result).toBe(EventFlipResult.SELECT);
    expect(this.model.currentCustomerEvents).toEqual([REFERENCE_CHOICES[0]]);
    expect(this.model.containsEvent(REFERENCE_EVENTS[0].id)).toBeTruthy();
  });

  it('unassigns previously selected event', () => {
    this.model.addCustomer(REFERENCE_CUSTOMER);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);
    this.model.flipEvent(REFERENCE_EVENTS[0]);

    const result = this.model.flipEvent(REFERENCE_EVENTS[0]);

    expect(result).toBe(EventFlipResult.UNSELECT);
    expect(this.model.containsEvent(REFERENCE_EVENTS[0].id)).toBeFalsy();
    expect(this.model.currentCustomerEvents).toEqual([]);
  });

  it('assigns events to the right customer', () => {
    this.model.addCustomer(REFERENCE_CUSTOMER);
    this.model.addCustomer(ALTERNATE_CUSTOMER);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);

    this.model.flipEvent(REFERENCE_EVENTS[0]);
    this.model.setCurrentCustomer(ALTERNATE_CUSTOMER);

    expect(this.model.currentCustomerEvents).toEqual([]);
  });

  it('does nothing if flipped event is full', () => {
    this.model.addCustomer(REFERENCE_CUSTOMER);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);

    const result = this.model.flipEvent(REFERENCE_EVENTS[2]);

    expect(result).toBe(EventFlipResult.NONE);
    expect(this.model.containsEvent(REFERENCE_EVENTS[2].id)).toBeFalsy();
  });

  it('does nothing if no customer is selected', () => {
    this.model.addCustomer(REFERENCE_CUSTOMER);

    const result = this.model.flipEvent(REFERENCE_EVENTS[0]);

    expect(result).toBe(EventFlipResult.NONE);
  });

  it('assigns event to current customer even if selected by another customer', () => {
    this.model.addCustomer(ALTERNATE_CUSTOMER);
    this.model.setCurrentCustomer(ALTERNATE_CUSTOMER);
    this.model.flipEvent(REFERENCE_EVENTS[0]);

    this.model.addCustomer(REFERENCE_CUSTOMER);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);
    const result = this.model.flipEvent(REFERENCE_EVENTS[0]);

    expect(result).toBe(EventFlipResult.SELECT);
    expect(this.model.currentCustomerEvents).toEqual([REFERENCE_CHOICES[0]]);
    expect(this.model.containsEvent(REFERENCE_EVENTS[0].id)).toBeTruthy();
  });

  it('reports event highlight changes on customer switch', () => {
    this.model.addCustomer(REFERENCE_CUSTOMER);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);
    this.model.flipEvent(REFERENCE_EVENTS[0]);
    this.model.addCustomer(ALTERNATE_CUSTOMER);
    this.model.setCurrentCustomer(ALTERNATE_CUSTOMER);
    this.model.flipEvent(REFERENCE_EVENTS[1]);

    const result = this.model.setCurrentCustomer(REFERENCE_CUSTOMER);

    expect(result.unselectedEventIds).toEqual([REFERENCE_CHOICES[1].id]);
    expect(result.selectedEventIds).toEqual([REFERENCE_CHOICES[0].id]);
  });

  it('contains events when created with an order', () => {
    this.model = new OrderModel(SAMPLE_ORDER, [REFERENCE_CUSTOMER, ALTERNATE_CUSTOMER]);

    expect(this.model.isNewOrder()).toBeFalsy();
    expect(this.model.containsEvent(REFERENCE_EVENTS[1].id)).toBeTruthy();
    expect(this.model.containsEvent(REFERENCE_EVENTS[2].id)).toBeTruthy();
    expect(this.model.containsCustomer(REFERENCE_CUSTOMER)).toBeTruthy();
    expect(this.model.containsCustomer(ALTERNATE_CUSTOMER)).toBeTruthy();
    expect(this.model.currentCustomer).toBeNull();
  });

  it('does not contain a customer events once the customer is removed', () => {
    this.model = new OrderModel(SAMPLE_ORDER, [REFERENCE_CUSTOMER, ALTERNATE_CUSTOMER]);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);

    const removedChoices = this.model.removeCustomer(REFERENCE_CUSTOMER);

    expect(this.model.containsCustomer(REFERENCE_CUSTOMER)).toBeFalsy();
    expect(this.model.containsEvent(REFERENCE_EVENTS[2].id)).toBeFalsy();
    expect(removedChoices).toEqual([REFERENCE_EVENTS[2].id]);
  });

  it('still contains other customer events once a customer is removed', () => {
    this.model = new OrderModel(SAMPLE_ORDER, [REFERENCE_CUSTOMER, ALTERNATE_CUSTOMER]);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);

    this.model.removeCustomer(REFERENCE_CUSTOMER);

    expect(this.model.containsEvent(REFERENCE_EVENTS[1].id)).toBeTruthy();
  });

  it('switches contact to the next customer in order', () => {
    this.model = new OrderModel(SAMPLE_ORDER, [REFERENCE_CUSTOMER, ALTERNATE_CUSTOMER]);
    this.model.setCurrentCustomer(REFERENCE_CUSTOMER);

    this.model.removeCustomer(REFERENCE_CUSTOMER);

    expect(this.model.contactId).toEqual(ALTERNATE_CUSTOMER.id);
  });
});
