import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '../calendar/fullcalendar.component';
import { Options } from 'fullcalendar';

import { Customer } from '../model/customer';
import { EventService } from '../calendar/event.service';
import { Arrays } from "../model/arrays";
import { CustomerAppointments } from "../model/order";
import {AppointmentService} from "../calendar/appointment.service";


@Component({
  selector: 'osc-front-order',
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit {
  title: string;
  calendarOptions: Options;
  @ViewChild(FullCalendarComponent) ucCalendar: FullCalendarComponent;

  currentCustomer: Customer;
  appointments: CustomerAppointments[] = [];

  constructor(private eventService: EventService, private appointmentsService: AppointmentService) {}

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
          this.ucCalendar.updateEvent(event);
        });
    }
    // highlight events of next user
    this.appointments
      .filter(ca => ca.customer.id === next.id)
      .reduce((reduced, ca) => [...reduced, ...ca.appointments], []) // flatten the appointments
      .forEach(a => {
        let event = this.ucCalendar.clientEvents(a.eventId)[0];
        event.borderColor = 'red';
        this.ucCalendar.updateEvent(event);
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
    this.ucCalendar.updateEvent(model.event);
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
