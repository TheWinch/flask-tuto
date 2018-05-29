import {Injectable} from '@angular/core';
import * as moment from 'moment';

import {Observable, of} from 'rxjs';

import {EventService} from './event.service';
import {Event} from '../model/event';

@Injectable()
export class EventServiceMock implements EventService {
  private repo: Event[] = this.createRepo();
  private counter = 17;

  constructor() {
  }

  public getEvents(): Observable<Event[]> {
    return of(this.repo);
  }

  public getEventsByDate(start: Date, end: Date): Observable<Event[]> {
    return of(this.repo.filter(event => {
      const d = event.start instanceof Date ? event.start : moment(event.start);
      return event.start.isAfter(start) && event.start.isBefore(end);
    }));
  }

  public updateEvent(id, start: Date, end: Date): Observable<Event> {
    const event: Event = this.repo.filter(e => e.id === id)[0];
    event.start = moment(start);
    event.end = moment(end);
    return of(event);
  }

  public createEvents(model: Event[]): Observable<Event[]> {
    const generated: Event[] = [];
    for (const e of model) {
      const item = {
        id: this.counter++,
        start: e.start,
        end: e.end,
        title: e.title,
        capacity: e.capacity
      };
      generated.push(item);
      this.repo.push(item);
    }
    return of(generated);
  }

  private createRepo(): Event[] {
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
        title: '',
        start: moment('' + yearMonth + (day - 2) + 'T08:00:00'),
        end: moment('' + yearMonth + (day - 2) + 'T10:00:00'),
        capacity: 6
      },
      {
        id: 2,
        title: '',
        start: moment('' + yearMonth + (day - 2) + 'T10:30:00'),
        end: moment('' + yearMonth + (day - 2) + 'T12:30:00'),
        capacity: 8
      },
      {
        id: 3,
        title: '',
        start: moment('' + yearMonth + (day - 2) + 'T14:00:00'),
        end: moment('' + yearMonth + (day - 2) + 'T16:00:00'),
        capacity: 8
      },
      {
        id: 4,
        title: '',
        start: moment('' + yearMonth + (day - 2) + 'T16:30:00'),
        end: moment('' + yearMonth + (day - 2) + 'T18:30:00'),
        capacity: 8
      },
      {
        id: 5,
        title: '',
        start: moment('' + yearMonth + (day - 1) + 'T08:00:00'),
        end: moment('' + yearMonth + (day - 1) + 'T10:00:00'),
        capacity: 5
      },
      {
        id: 6,
        title: '',
        start: moment('' + yearMonth + (day - 1) + 'T10:30:00'),
        end: moment('' + yearMonth + (day - 1) + 'T12:30:00'),
        capacity: 8
      },
      {
        id: 7,
        title: '',
        start: moment('' + yearMonth + (day - 1) + 'T14:00:00'),
        end: moment('' + yearMonth + (day - 1) + 'T16:00:00'),
        capacity: 8
      },
      {
        id: 8,
        title: '',
        start: moment('' + yearMonth + (day - 1) + 'T16:30:00'),
        end: moment('' + yearMonth + (day - 1) + 'T18:30:00'),
        capacity: 8
      },
      {
        id: 9,
        title: '',
        start: moment('' + yearMonth + (day) + 'T08:00:00'),
        end: moment('' + yearMonth + (day) + 'T10:00:00'),
        capacity: 2
      },
      {
        id: 10,
        title: '',
        start: moment('' + yearMonth + (day) + 'T10:30:00'),
        end: moment('' + yearMonth + (day) + 'T12:30:00'),
        capacity: 0
      },
      {
        id: 11,
        title: '',
        start: moment('' + yearMonth + (day) + 'T14:00:00'),
        end: moment('' + yearMonth + (day) + 'T16:00:00'),
        capacity: 2
      },
      {
        id: 12,
        title: '',
        start: moment('' + yearMonth + (day) + 'T16:30:00'),
        end: moment('' + yearMonth + (day) + 'T18:30:00'),
        capacity: 2
      },
      {
        id: 13,
        title: '',
        start: moment('' + yearMonth + (day + 1) + 'T08:00:00'),
        end: moment('' + yearMonth + (day + 1) + 'T10:00:00'),
        capacity: 4
      },
      {
        id: 14,
        title: '',
        start: moment('' + yearMonth + (day + 1) + 'T10:30:00'),
        end: moment('' + yearMonth + (day + 1) + 'T12:30:00'),
        capacity: 5
      },
      {
        id: 15,
        title: '',
        start: moment('' + yearMonth + (day + 1) + 'T14:00:00'),
        end: moment('' + yearMonth + (day + 1) + 'T16:00:00'),
        capacity: 1
      },
      {
        id: 16,
        title: '',
        start: moment('' + yearMonth + (day + 1) + 'T16:30:00'),
        end: moment('' + yearMonth + (day + 1) + 'T18:30:00'),
        capacity: 7
      },
    ];
  }
}
