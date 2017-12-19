import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';

import { Customer } from '../model/customer';
import { EventService } from '../calendar/event.service';
import {Arrays} from "../model/arrays";

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


@Component({
  selector: 'osc-front-order',
  templateUrl: './order.component.html',
  styleUrls: ['../calendar/calendar.component.css']
})
export class OrderComponent implements OnInit {
  title: string;
  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  private currentCustomer: Customer;
  private appointments: CustomerAppointments[] = [];

  constructor(private eventService: EventService) {}

  passOrder() {
    console.log('I want to complete my order!');
  }

  onCustomerSelected(customer: Customer): void {
    this.switchCustomer(customer);
  }

  private switchCustomer(next: Customer) {
    // un-highlight all events of current user
    if (this.currentCustomer != null) {
      this.appointments
        .filter(ca => ca.customer.id === this.currentCustomer.id)
        .reduce((reduced, ca) => [...reduced, ...ca.appointments], []) // flatten the appointments
        .forEach(a => {
          let event = this.ucCalendar.fullCalendar('clientEvents', a.eventId)[0];
          event.borderColor = '';
          this.ucCalendar.fullCalendar('updateEvent', event);
        });
    }
    // highlight events of next user
    this.appointments
      .filter(ca => ca.customer.id === next.id)
      .reduce((reduced, ca) => [...reduced, ...ca.appointments], []) // flatten the appointments
      .forEach(a => {
        let event = this.ucCalendar.fullCalendar('clientEvents', a.eventId)[0];
        event.borderColor = 'red';
        this.ucCalendar.fullCalendar('updateEvent', event);
      });
    // switch state
    this.currentCustomer = next;
  }

  onCustomerAdded(customer: Customer): void {
    // if it isn't in the list already
    if (this.appointments.reduce((contains, ca) => contains && ca.customer.id !== customer.id, true)) {
      this.appointments = Arrays.append(this.appointments, new CustomerAppointments(customer, []));
    }
    this.switchCustomer(customer);
  }

  addOrRemoveEvent(model: any): void {
    if (this.currentCustomer == null) {
      return;
    }

    const oldCa: CustomerAppointments = this.appointments.filter(ca => ca.customer.id === this.currentCustomer.id)[0];
    let hadAppointment = oldCa.hasAppointment(model.event);
    let newCa = hadAppointment ? oldCa.removeAppointment(model.event) : oldCa.addAppointment(model.event);
    this.appointments = Arrays.updateElement(this.appointments, oldCa, newCa);

    // and update the calendar rendering
    model.event.borderColor = hadAppointment ? '' : 'red';
    this.ucCalendar.fullCalendar('updateEvent', model.event);
  }

  ngOnInit() {
    this.eventService.getEvents().subscribe(data => {
        this.calendarOptions = {
          height: 688,
          defaultView: 'agendaWeek',
          locale: 'fr',
          firstDay: 1,
          minTime: '8:00',
          maxTime: '19:00',
          editable: false,
          eventLimit: false,
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listMonth'
          },
          businessHours: {
            dow: [ 0, 1, 2, 3, 4, 5, 6 ],
              start: '8:00',
              end: '19:00',
          },
          events: data
        };
      });
  }
}
