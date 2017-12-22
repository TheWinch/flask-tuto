import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import {AppointmentService, Appointment, Order} from "./appointment.service";

@Injectable()
export class AppointmentServiceMock implements AppointmentService {
  private appointments: Appointment[];
  private appointmentIdGenerator: number = 11;
  private orders: Order[];
  private orderIdGenerator: number = 2;

  constructor() {
    this.appointments = AppointmentServiceMock.createAppointmentsRepo();
    this.orders = AppointmentServiceMock.createOrdersRepo(this.appointments);
  }

  public getAppointments(): Observable<Appointment[]> {
      return of(this.appointments);
  }

  public getAppointmentsByCustomer(start: Date, end: Date, customerId: number): Observable<Appointment[]> {
    return of(this.appointments.filter(event => {
        let d = new Date(event.start);
        return event.customerId === customerId && d >= start && d < end;
      }));
  }

  public createAppointments(model: Appointment[]): Observable<Appointment[]> {
    return of(this.saveAppointments(0, model));
  }

  /**
   * Note that an appointment cannot be modified, it can only be created or deleted.
   */
  private saveAppointments(orderId: number, model: Appointment[]): Appointment[] {
    const generated: Appointment[] = [];
    for (let e of model) {
      let item = e;
      if (e.id == null) {
        item = Object.assign({}, item, {id: this.appointmentIdGenerator++, orderId: orderId});
        this.appointments.push(item);
      }
      generated.push(item);
    }
    return generated;
  }

  public getOrder(customerId: number): Observable<Order> {
    let filtered = this.orders.filter(order => order.appointments != null && order.appointments.filter(c => c.customerId == customerId).length != 0);
    if (filtered.length > 0) {
      return Observable.of(filtered[0]);
    } else {
      return Observable.of(null);
    }
  }

  public createOrder(order: Order): Observable<Order> {
    let orderId = order.id == null ? this.orderIdGenerator++ : order.id;
    let savedOrder: Order = {
      id: orderId,
      title: order.title,
      appointments: this.saveAppointments(orderId, order.appointments)
    };
    return Observable.of(savedOrder);
  }

  private static createAppointmentsRepo(): Appointment[] {
      const dateObj = new Date();
      let yearMonth = dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1);
      const day = dateObj.getUTCDate();
      const dayStr = '' + day;
      if(dayStr.length === 1) {
        yearMonth = yearMonth + '0';
      }
        return [
          {
            id: 1,
            customerId: 1,
            orderId: 1,
            slotId: 1,
            start: yearMonth + (day - 2) + 'T08:00:00',
          },
          {
            id: 2,
            customerId: 2,
            orderId: 1,
            slotId: 1,
            start: yearMonth + (day - 2) + 'T08:00:00',
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
        ];
    }

  private static createOrdersRepo(appointments: Appointment[]): Order[] {
    return [
      {
        id: 1,
        title: 'mercredi 20 décembre 2017 à 09:56:34 GMT+01:00',
        appointments: appointments.filter(a => a.orderId == 1)
      }
    ]
  }

}
