import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { AppointmentService, Appointment } from "./appointment.service";

@Injectable()
export class AppointmentServiceMock implements AppointmentService {
  private repo: Appointment[] = this.createRepo();
  private counter: number = 11;

  public getAppointments(): Observable<Appointment[]> {
      return of(this.repo);
  }

  public getAppointmentsByCustomer(start: Date, end: Date, customerId: number): Observable<Appointment[]> {
    return of(this.repo.filter(event => {
        let d = event.start instanceof Date ? event.start: new Date(event.start);
        return event.customerId === customerId && d >= start && d < end;
      }));
  }

  public createAppointments(model: Appointment[]): Observable<Appointment[]> {
      const generated: Appointment[] = [];
      for (let e of model) {
        let item: Appointment = {
          id: this.counter++,
          start: e.start,
          customerId: e.customerId,
          slotId: e.slotId,
          orderId: e.orderId
        };
        generated.push(item);
        this.repo.push(item);
      }
      return of(generated);
    }

    private createRepo(): Appointment[] {
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
    /*
          {
            id: 2,
            start: yearMonth + (day-2) + 'T10:30:00',
            end: yearMonth + (day-2) + 'T12:30:00',
            capacity: 8
          },
          {
            id: 3,
            start: yearMonth + (day-2) + 'T14:00:00',
            end: yearMonth + (day-2) + 'T16:00:00',
            capacity: 8
          },
          {
            id: 4,
            start: yearMonth + (day-1) + 'T16:30:00',
            end: yearMonth + (day-1) + 'T18:30:00',
            capacity: 8
          },
          {
            id: 5,
            start: yearMonth + (day-1) + 'T08:00:00',
            end: yearMonth + (day-1) + 'T10:00:00',
            capacity: 8
          },
          {
            id: 6,
            start: yearMonth + (day-1) + 'T10:30:00',
            end: yearMonth + (day-1) + 'T12:30:00',
            capacity: 8
          },
          {
            id: 7,
            start: yearMonth + (day-1) + 'T14:00:00',
            end: yearMonth + (day-1) + 'T16:00:00',
            capacity: 8
          },
          {
            id: 8,
            start: yearMonth + (day-1) + 'T16:30:00',
            end: yearMonth + (day-1) + 'T18:30:00',
            capacity: 8
          },
          {
            id: 9,
            start: yearMonth + (day) + 'T08:00:00',
            end: yearMonth + (day) + 'T10:00:00',
            capacity: 8
          },
          {
            id: 10,
            start: yearMonth + (day) + 'T10:30:00',
            end: yearMonth + (day) + 'T12:30:00',
            capacity: 8
          },
          {
            id: 11,
            start: yearMonth + (day-1) + 'T14:00:00',
            end: yearMonth + (day) + 'T16:00:00',
            capacity: 8
          },
          {
            id: 12,
            start: yearMonth + (day) + 'T16:30:00',
            end: yearMonth + (day) + 'T18:30:00',
            capacity: 8
          },
        ];
        */
    }
}
