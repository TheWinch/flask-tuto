import * as moment from 'moment';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { FullCalendarComponent } from '../calendar/fullcalendar.component';

import { Customer } from '../model/customer';
import { CustomerSelection } from '../model/customer-choices';
import { Event } from '../model/event';
import { Appointment, Order } from '../model/order';
import { ImmutableArrays } from '../model/immutable-arrays';
import { EventService } from '../services/event.service';
import { AppointmentService } from '../services/appointment.service';
import { CustomerService } from '../services/customer.service';

import { OptionsInput } from 'fullcalendar';
import { Observable, forkJoin, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import { equalParamsAndUrlSegments } from '@angular/router/src/router_state';
import { OrderModel, EventFlipResult } from '../model/order.model';


@Component({
  selector: 'osc-order-details',
  templateUrl: './order-edit.component.html'
})
export class OrderEditComponent implements OnInit {
  cameFrom: string;
  title: string;
  calendarOptions: OptionsInput;
  private readonly frozenNow = moment(new Date());
  @ViewChild(FullCalendarComponent)
  ucCalendar: FullCalendarComponent;
  @Output() created = new EventEmitter();
  @Output() aborted = new EventEmitter();
  orderModel: OrderModel = null;

  private formatEvent(event: Event, isSelectedBySomeone: boolean, isForCurrentCustomer: boolean): void {
    let backgroundColor = '';
    if (event.end.isBefore(this.frozenNow)) {
      backgroundColor = isForCurrentCustomer ? 'lightgrey' : 'grey';
    } else if (isForCurrentCustomer) {
      backgroundColor = '#20c997';
    } else if (event.capacity === 0) {
      backgroundColor = 'grey';
    } else if (isSelectedBySomeone) {
      backgroundColor = '#5bc0de';
    }

    Object.assign(event, {
      backgroundColor: backgroundColor,
    });
  }

  private enrichEvent(event: Event) {
    event.capacity = event.capacity - event.used; // make capacity the remaining capacity
    event.start = moment(event.start);
    event.end = moment(event.end);
    event = Object.assign(event, { title: event.capacity + ' restant(s)' });
    this.formatEvent(event, this.orderModel.containsEvent(event.id),
                     this.orderModel.currentCustomerEvents.some(c => c.id === event.id));
}

  private makeCalendarOptions(): OptionsInput {
    // solve visibility issues
    const eventService = this.eventService;
    const orderModel = this.orderModel;
    const capturedThis = this;
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
      columnHeaderFormat: 'ddd D/M',
      views: {
        agendaWeek: {
          columnHeaderFormat: 'ddd D/M'
        }
      },
      allDaySlot: false,
      defaultDate: orderModel.minDate,
      events: function (start, end, timezone, callback) {
        eventService.getEventsByDate(start.toDate(), end.toDate()).subscribe(events => {
          events.forEach(e => capturedThis.enrichEvent(e));
          callback(events);
        });
      }
    };
  }

  constructor(private eventService: EventService,
    private appointmentService: AppointmentService,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute) { }

  passOrder() {
    const order = this.orderModel.buildOrder();
    if (this.orderModel.isNewOrder()) {
      this.appointmentService.createOrder(order).subscribe(data => {
        this.created.emit(data);
        this.router.navigate([this.cameFrom], { queryParams: { title: order.title } });
      }, failure => {
        console.error('Could not create order: ' + failure);
      });
    } else {
      this.appointmentService.updateOrder(order).subscribe(data => {
        this.router.navigate([this.cameFrom]);
      }, failure => {
        console.error('Could not update order: ' + failure);
      });
    }
  }

  abortOrder() {
    this.aborted.emit('');
    this.router.navigate([this.cameFrom]);
  }

  onCustomerSelected(customer: Customer): void {
    this.switchCustomer(customer);
  }

  onCustomerRemoved(customer: Customer): void {
    const removedEventIds = this.orderModel.removeCustomer(customer);
    removedEventIds.forEach(id => {
      const event = this.ucCalendar.fullCalendar('clientEvents', id)[0];
      event.capacity = event.capacity + 1;
      this.formatEvent(event, this.orderModel.containsEvent(id),
                       this.orderModel.currentCustomerEvents.some(c => c.id === event.id));
      event.title = event.capacity + ' restant(s)';
      this.ucCalendar.updateEvent(event);
    });
  }

  onCustomerAdded(customer: Customer): void {
    this.orderModel.addCustomer(customer);
    this.switchCustomer(customer);
  }

  onEventSelected(model: any): void {
    const event = model.event;
    if (event.end.isBefore(this.frozenNow)) {
      return;
    }
    const result = this.orderModel.flipEvent(event);
    if (result === EventFlipResult.NONE) {
      return;
    }
    if (result === EventFlipResult.SELECT) {
      event.capacity = event.capacity - 1;
      this.formatEvent(event, true, true);
    } else {
      event.capacity = event.capacity + 1;
      this.formatEvent(event, this.orderModel.containsEvent(event.id), false);
    }
    event.title = event.capacity + ' restant(s)';
    this.ucCalendar.updateEvent(event);
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      if (params.get('from') == null) {
        this.cameFrom = 'orders';
      } else {
        this.cameFrom = params.get('from');
      }
    });
    this.route.paramMap.pipe(flatMap((params: ParamMap) => {
      if (params.get('id') === 'new') {
        return of(null);
      } else {
        return this.appointmentService.getOrder(params.get('id'));
      }
    })).subscribe(ord => {
      const appointments = ord != null ? ord.appointments : [];
      const distinctSlots = new Set<number>(appointments.map(a => a.slotId));
      const customerObservable: Observable<Customer[]> = this.getCustomersForAppointments(appointments);

      customerObservable.subscribe(customers => {
        this.orderModel = new OrderModel(ord, customers);
        this.calendarOptions = this.makeCalendarOptions();
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
    const eventUpdates = this.orderModel.setCurrentCustomer(next);

    eventUpdates.unselectedEventIds.forEach(id => {
      const event = this.ucCalendar.fullCalendar('clientEvents', id)[0];
      if (event !== undefined) { // could be out of view
        this.formatEvent(event, this.orderModel.containsEvent(id), false);
        this.ucCalendar.updateEvent(event);
      }
    });
    eventUpdates.selectedEventIds.forEach(id => {
      const event = this.ucCalendar.fullCalendar('clientEvents', id)[0];
      if (event !== undefined) { // could be out of view
        this.formatEvent(event, true, true);
        this.ucCalendar.updateEvent(event);
      }
    });
  }
}
