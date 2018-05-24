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

import { Options } from 'fullcalendar';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { flatMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
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
  calendarOptions: Options;
  @ViewChild(FullCalendarComponent) ucCalendar: FullCalendarComponent;

  @Output() created = new EventEmitter();
  @Output() aborted = new EventEmitter();
  orderModel: OrderModel = null;

  private static formatEvent(event: Event, isSelectedBySomeone: boolean, isForCurrentCustomer: boolean): void {
    let backgroundColor = event.capacity > 0 ? '' : 'grey';
    if (isForCurrentCustomer) {
      backgroundColor = '#5bc0de';
    } else if (event.capacity === 0) {
      backgroundColor = 'grey';
    } else if (isSelectedBySomeone) {
      backgroundColor = '#20c997';
    }

    Object.assign(event, {
      backgroundColor: backgroundColor,
    });
  }

  private makeCalendarOptions(data: any[]): any {
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

  /**
   * Enrich the events in the calendar with their color and title
   */
  private buildEvents(allEvents: Event[]): any[] {
    return allEvents.map(e => {
      e.capacity = e.capacity - e.used; // make capacity the remaining capacity
      e = Object.assign(e, { title: e.capacity + ' restant(s)' });
      OrderEditComponent.formatEvent(e, this.orderModel.containsEvent(e.id),
            this.orderModel.currentCustomerEvents.some(c => c.id === e.id));
      return e;
    }, this);
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
      OrderEditComponent.formatEvent(event, this.orderModel.containsEvent(id),
                                 this.orderModel.currentCustomerEvents.some(c => c.id === event.id));
      event.capacity = event.capacity + 1;
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
    const result = this.orderModel.flipEvent(event);
    if (result === EventFlipResult.NONE) {
      return;
    }
    if (result === EventFlipResult.SELECT) {
      event.capacity = event.capacity - 1;
      OrderEditComponent.formatEvent(event, true, true);
    } else {
      event.capacity = event.capacity + 1;
      OrderEditComponent.formatEvent(event, this.orderModel.containsEvent(event.id), false);
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
      const eventsObservable: Observable<Event[]> = this.eventService.getEvents(); // TODO - restrict to this week and after

      forkJoin(customerObservable, eventsObservable)
        .subscribe(data => {
          this.orderModel = new OrderModel(ord, data[0]);
          const coloredEvents = this.buildEvents(data[1]);
          this.calendarOptions = this.makeCalendarOptions(coloredEvents);
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
      OrderEditComponent.formatEvent(event, this.orderModel.containsEvent(id), false);
      this.ucCalendar.updateEvent(event);
    });
    eventUpdates.selectedEventIds.forEach(id => {
      const event = this.ucCalendar.fullCalendar('clientEvents', id)[0];
      OrderEditComponent.formatEvent(event, true, true);
      this.ucCalendar.updateEvent(event);
    });
  }
}
