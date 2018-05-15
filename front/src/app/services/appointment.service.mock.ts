import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';

import {Appointment, Order} from '../model/order';
import {AppointmentService} from './appointment.service';


@Injectable()
export class AppointmentServiceMock implements AppointmentService {
  private appointments: Appointment[];
  private appointmentIdGenerator = 11;
  private orders: Order[];
  private orderIdGenerator = 2;

  private static createAppointmentsRepo(): Appointment[] {
    const dateObj = new Date();
    let yearMonth = dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1) + '-';
    const day = dateObj.getUTCDate();
    const dayStr = '' + day;
    if (dayStr.length === 1) {
      yearMonth = yearMonth + '0';
    }
      return [
        {
          id: 1,
          customerId: 1,
          orderId: 1,
          slotId: 2,
          start: yearMonth + (day - 2) + 'T10:30:00',
        },
        {
          id: 2,
          customerId: 2,
          orderId: 1,
          slotId: 2,
          start: yearMonth + (day - 2) + 'T10:30:00',
        },
        {
          id: 3,
          customerId: 1,
          orderId: 1,
          slotId: 5,
          start: yearMonth + (day - 1) + 'T08:00:00',
        },
        {
          id: 4,
          customerId: 2,
          orderId: 1,
          slotId: 5,
          start: yearMonth + (day - 1) + 'T08:00:00',
        },
        {
          id: 5,
          customerId: 1,
          orderId: 1,
          slotId: 10,
          start: yearMonth + (day) + 'T10:30:00',
        },
        {
          id: 6,
          customerId: 2,
          orderId: 1,
          slotId: 10,
          start: yearMonth + (day) + 'T10:30:00',
        },
        {
          id: 7,
          customerId: 3,
          orderId: 2,
          slotId: 5,
          start: yearMonth + (day) + 'T10:30:00',
        },
        {
          id: 8,
          customerId: 3,
          orderId: 2,
          slotId: 10,
          start: yearMonth + (day) + 'T10:30:00',
        },
        {
          id: 8,
          customerId: 3,
          orderId: 2,
          slotId: 14,
          start: yearMonth + (day + 1) + 'T10:30:00',
        },
      ];
  }

  private static createOrdersRepo(appointments: Appointment[]): Order[] {
    return [
      {
        id: 1,
        title: 'lundi 18 décembre 2017 à 09:56:34 GMT+01:00',
        appointments: appointments.filter(a => a.orderId === 1)
      },
      {
        id: 2,
        title: 'mercredi 20 décembre 2017 à 13:56:34 GMT+01:00',
        appointments: appointments.filter(a => a.orderId === 2)
      },
    ];
  }

  constructor() {
    this.appointments = AppointmentServiceMock.createAppointmentsRepo();
    this.orders = AppointmentServiceMock.createOrdersRepo(this.appointments);
  }

  /**
   * Note that an appointment cannot be modified, it can only be created or deleted.
   */
  private saveAppointments(orderId: number, model: Appointment[]): Appointment[] {
    const generated: Appointment[] = [];
    for (const e of model) {
      let item = e;
      if (e.id == null) {
        item = Object.assign({}, item, {id: this.appointmentIdGenerator++, orderId: orderId});
        this.appointments.push(item);
      }
      generated.push(item);
    }
    return generated;
  }

  public getOrder(id: number): Observable<Order> {
    return Observable.of(this.orders.find(order => order.id === id));
  }

  public getOrders(): Observable<Order[]> {
    return Observable.of(this.orders);
  }

  public searchOrders(customerId: number): Observable<Order[]> {
    return Observable.of(this.orders.filter(o => o.appointments.some(a => a.customerId === customerId)));
  }

  public createOrder(order: Order): Observable<Order> {
    const orderId = order.id == null ? this.orderIdGenerator++ : order.id;
    const savedOrder: Order = {
      id: orderId,
      title: order.title,
      appointments: this.saveAppointments(orderId, order.appointments)
    };
    return Observable.of(savedOrder);
  }

  public updateOrder(order: Order): Observable<Order> {
    return Observable.of(order);
  }

}
