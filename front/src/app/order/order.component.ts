import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FullCalendarComponent} from '../calendar/fullcalendar.component';

import {Customer} from '../model/customer';
import {Event} from '../model/event';
import {Appointment, CustomerChoices, Order} from '../model/order';
import {Arrays} from '../model/arrays';
import {EventService} from '../services/event.service';
import {AppointmentService} from '../services/appointment.service';
import {CustomerService} from '../services/customer.service';

import {Options} from 'fullcalendar';
import {Observable} from 'rxjs/Observable';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {flatMap} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {DatePipe} from '@angular/common';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { equalParamsAndUrlSegments } from '@angular/router/src/router_state';


@Component({
  selector: 'osc-order-details',
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit {
  title: string;
  calendarOptions: Options;
  @ViewChild(FullCalendarComponent) ucCalendar: FullCalendarComponent;

  @Output() created = new EventEmitter();
  @Output() aborted = new EventEmitter();
  order: Observable<Order>;
  orderId: number = null;
  currentCustomer: Customer;
  contact = 0;
  choices: CustomerChoices[] = [];

  private static makeCalendarOptions(data: any[]): any {
    return {
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
        dow: [0, 1, 2, 3, 4, 5, 6],
        start: '8:00',
        end: '19:00',
      },
      allDaySlot: false,
      events: data
    };
  }

  private static buildEvents(selectedSlots: Set<number>, events: Event[]): any[] {
    return events.map(e => {
      return Object.assign(e, {
        title: e.capacity + ' restant(s)',
        backgroundColor: OrderComponent.backgroundColor(e.capacity),
        borderColor: selectedSlots.has(e.id) ? 'red' : ''
      });
    });
  }

  private static backgroundColor(capacity: number): string {
    return capacity > 0 ? '' : 'grey';
  }

  private static toOrder(orderId: number, choices: CustomerChoices[], contact: number): Order {
    const reducer = function (appointments: Appointment[], cc: CustomerChoices): Appointment[] {
      const mapped: Appointment[] = cc.choices.map(choice => {
        return {
          customerId: cc.customer.id,
          slotId: choice.eventId,
          orderId: orderId
        };
      });
      appointments.push(...mapped);
      return appointments;
    };

    return {
      title: new DatePipe('fr').transform(new Date(), 'full'),
      contactId: contact,
      appointments: choices.reduce(reducer, [])
    };
  }

  constructor(private eventService: EventService,
              private appointmentService: AppointmentService,
              private customerService: CustomerService,
              private router: Router,
              private route: ActivatedRoute) {  }

  passOrder() {
    const order = OrderComponent.toOrder(this.orderId, this.choices, this.contact);
    if (this.orderId != null) {
      // TODO: update order on the server
      this.router.navigate(['orders']);
    } else {
      this.appointmentService.createOrder(order).subscribe(data => {
        this.created.emit(data);
        this.router.navigate(['orders'], { queryParams: { title: order.title}});
      }, failure => {
      });
    }
  }

  abortOrder() {
    this.aborted.emit('');
    this.router.navigate(['orders']);
  }

  onCustomerSelected(customer: Customer): void {
    this.switchCustomer(customer);
  }

  onCustomerAdded(customer: Customer): void {
    // if it isn't in the list already
    if (this.choices.reduce((contains, ca) => contains && ca.customer.id !== customer.id, true)) {
      this.choices = Arrays.append(this.choices, new CustomerChoices(customer, []));
      if (this.contact === 0) {
        this.contact = customer.id;
      }
    }
    this.switchCustomer(customer);
  }

  addOrRemoveEvent(model: any): void {
    if (this.currentCustomer == null) {
      return;
    }

    const oldChoices: CustomerChoices = this.choices.filter(ca => ca.customer.id === this.currentCustomer.id)[0];
    const hadChosenEvent = oldChoices.hasChosenEvent(model.event);
    let newChoices = null;
    if (hadChosenEvent) {
      newChoices = oldChoices.unselectEvent(model.event);
    } else if (model.event.capacity > 0) {
      newChoices = oldChoices.selectEvent(model.event);
    } else {
      return;
    }
    this.choices = Arrays.updateElement(this.choices, oldChoices, newChoices);
    if (hadChosenEvent) {
      model.event.capacity = model.event.capacity + 1;
      model.event.backgroundColor = '';
      // Remove the bg color if no more customer has chosen the slot
      const isInOrder = this.choices.some(cc => cc.hasChosenEvent(model.event));
      if (!isInOrder) {
        model.event.borderColor = '';
      }
    } else {
      model.event.borderColor = 'red';
      model.event.backgroundColor = '#20c997';
      model.event.capacity = model.event.capacity - 1;
    }
    model.event.title = model.event.capacity + ' restant(s)';
    this.ucCalendar.updateEvent(model.event);
  }

  ngOnInit() {
    this.route.paramMap.pipe(flatMap(params => params.get('id') === 'new' ? of(null) :
                           this.appointmentService.getOrder(params.get('id')))
      ).subscribe(ord => {
      this.orderId = ord == null ? null : ord.id;
      const appointments = ord != null ? ord.appointments : [];
      const distinctSlots = new Set<number>(appointments.map(a => a.slotId));
      const customerObservable: Observable<Customer[]> = this.getCustomersForAppointments(appointments);
      const eventsObservable: Observable<Event[]> = this.eventService.getEvents(); // TODO - restrict to this week and after

      forkJoin(customerObservable, eventsObservable)
        .subscribe(data => {
          this.choices = data[0].map( customer => new CustomerChoices(
            customer,
            appointments
              .filter(a => a.customerId === customer.id)
              .map(a => {
                return {
                  eventId: a.slotId,
                  start: new Date(a.start) // TODO - use event's start date instead
                };
              })
          ));
          const coloredEvents = OrderComponent.buildEvents(distinctSlots, data[1]);
          this.calendarOptions = OrderComponent.makeCalendarOptions(coloredEvents);
        });
      }
    );
  }

  private getCustomersForAppointments(appointments: Appointment[]): Observable<Customer[]> {
    const customerQueries: Observable<Customer>[] = [];
    // This will query each unique (thanks to the Set) customer in the order
    new Set(appointments.map(choice => choice.customerId))
      .forEach(id => customerQueries.push(this.customerService.getCustomer(id)));
    return customerQueries.length > 0 ? forkJoin(...customerQueries) : of([]);
  }

  private switchCustomer(next: Customer) {
    // un-highlight all events of current user
    if (this.currentCustomer != null) {
      this.choices
        .filter(ca => ca.customer.id === this.currentCustomer.id)
        .reduce((reduced, ca) => [...reduced, ...ca.choices], []) // flatten the appointments
        .forEach(a => {
          const event = this.ucCalendar.fullCalendar('clientEvents', a.eventId)[0];
          event.backgroundColor = OrderComponent.backgroundColor(event.capacity);
          this.ucCalendar.updateEvent(event);
        });
    }
    // highlight events of next user
    this.choices
      .filter(ca => ca.customer.id === next.id)
      .reduce((reduced, ca) => [...reduced, ...ca.choices], []) // flatten the appointments
      .forEach(a => {
        const event = this.ucCalendar.clientEvents(a.eventId)[0];
        event.backgroundColor = '#20c997';
        this.ucCalendar.updateEvent(event);
      });
    // switch state
    this.currentCustomer = next;
  }
}
