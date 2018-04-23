import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';

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
      const d = event.start instanceof Date ? event.start : new Date(event.start);
      return d >= start && d < end;
    }));
  }

  public updateEvent(id, start: Date, end: Date): Observable<Event> {
    const event: Event = this.repo.filter(e => e.id === id)[0];
    event.start = start;
    event.end = end;
    return Observable.of(event);
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
        start: yearMonth + (day - 2) + 'T08:00:00',
        end: yearMonth + (day - 2) + 'T10:00:00',
        capacity: 6
      },
      {
        id: 2,
        start: yearMonth + (day - 2) + 'T10:30:00',
        end: yearMonth + (day - 2) + 'T12:30:00',
        capacity: 8
      },
      {
        id: 3,
        start: yearMonth + (day - 2) + 'T14:00:00',
        end: yearMonth + (day - 2) + 'T16:00:00',
        capacity: 8
      },
      {
        id: 4,
        start: yearMonth + (day - 2) + 'T16:30:00',
        end: yearMonth + (day - 2) + 'T18:30:00',
        capacity: 8
      },
      {
        id: 5,
        start: yearMonth + (day - 1) + 'T08:00:00',
        end: yearMonth + (day - 1) + 'T10:00:00',
        capacity: 5
      },
      {
        id: 6,
        start: yearMonth + (day - 1) + 'T10:30:00',
        end: yearMonth + (day - 1) + 'T12:30:00',
        capacity: 8
      },
      {
        id: 7,
        start: yearMonth + (day - 1) + 'T14:00:00',
        end: yearMonth + (day - 1) + 'T16:00:00',
        capacity: 8
      },
      {
        id: 8,
        start: yearMonth + (day - 1) + 'T16:30:00',
        end: yearMonth + (day - 1) + 'T18:30:00',
        capacity: 8
      },
      {
        id: 9,
        start: yearMonth + (day) + 'T08:00:00',
        end: yearMonth + (day) + 'T10:00:00',
        capacity: 2
      },
      {
        id: 10,
        start: yearMonth + (day) + 'T10:30:00',
        end: yearMonth + (day) + 'T12:30:00',
        capacity: 0
      },
      {
        id: 11,
        start: yearMonth + (day) + 'T14:00:00',
        end: yearMonth + (day) + 'T16:00:00',
        capacity: 2
      },
      {
        id: 12,
        start: yearMonth + (day) + 'T16:30:00',
        end: yearMonth + (day) + 'T18:30:00',
        capacity: 2
      },
      {
        id: 13,
        start: yearMonth + (day + 1) + 'T08:00:00',
        end: yearMonth + (day + 1) + 'T10:00:00',
        capacity: 4
      },
      {
        id: 14,
        start: yearMonth + (day + 1) + 'T10:30:00',
        end: yearMonth + (day + 1) + 'T12:30:00',
        capacity: 5
      },
      {
        id: 15,
        start: yearMonth + (day + 1) + 'T14:00:00',
        end: yearMonth + (day + 1) + 'T16:00:00',
        capacity: 1
      },
      {
        id: 16,
        start: yearMonth + (day + 1) + 'T16:30:00',
        end: yearMonth + (day + 1) + 'T18:30:00',
        capacity: 7
      },
    ];
  }
}
