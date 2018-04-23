import {Customer} from './customer';
import { Arrays } from './arrays';

export class CustomerChoice {
  start: Date;
  eventId: number;
}

export class CustomerChoices {
  customer: Customer;
  private _choices: CustomerChoice[];

  get sorted_choices() {
    return this._choices.sort((a, b) => a.start < b.start ? -1 : 1);
  }

  get choices() {
    return this._choices;
  }

  hasChosenEvent(event: any): boolean {
    return this._choices.reduce((contains, a) => contains || a.eventId === event.id, false);
  }

  selectEvent(event: any): CustomerChoices {
    if (this.hasChosenEvent(event)) {
      return this;
    }
    const newAppointments = Arrays.append(this._choices, {start: event.start, eventId: event.id});
    return new CustomerChoices(
      this.customer,
      newAppointments);
  }

  unselectEvent(event: any): CustomerChoices {
    return new CustomerChoices(
      this.customer,
      Arrays.removeMatching(this._choices, a => a.eventId === event.id)
    );
  }

  constructor(customer: Customer, appointments: CustomerChoice[]) {
    this.customer = customer;
    this._choices = appointments;
  }
}

export class Appointment {
  id?: number;
  customerId: number;
  orderId?: number;
  slotId: number;
  start?: string;
}

export class Order {
  id?: number;
  title: string;
  contact?: string;
  contactId?: number;
  appointments?: Appointment[];
}

