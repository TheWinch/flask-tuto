import {Customer} from "./customer";
import { Arrays } from "./arrays";

export class Appointment {
  start: Date;
  eventId: string;
}

export class CustomerAppointments {
  customer: Customer;
  private _appointments: Appointment[];

  get sorted_appointments() {
    return this._appointments.sort((a, b) => a.start < b.start ? -1 : 1);
  }

  get appointments() {
    return this._appointments;
  }

  hasAppointment(event: any): boolean {
    return this._appointments.reduce((contains, a) => contains || a.eventId === event._id, false);
  }

  addAppointment(event: any): CustomerAppointments {
    if (this.hasAppointment(event)) {
      return this;
    }
    let newAppointments = Arrays.append(this._appointments, {start: event.start, eventId: event._id});
    return new CustomerAppointments(
      this.customer,
      newAppointments);
  }

  removeAppointment(event: any): CustomerAppointments {
    return new CustomerAppointments(
      this.customer,
      Arrays.removeMatching(this._appointments, a => a.eventId === event._id)
    );
  }

  constructor(customer: Customer, appointments: Appointment[]) {
    this.customer = customer;
    this._appointments = appointments;
  }
}
