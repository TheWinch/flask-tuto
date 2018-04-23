import {Event} from '../model/event';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

export abstract class EventService {
    abstract getEvents(): Observable<Event[]>;
    abstract getEventsByDate(start: Date, end: Date): Observable<Event[]>;
    abstract createEvents(model: Event[]): Observable<Event[]>;
    abstract updateEvent(id, start: Date, end: Date): Observable<Event>;
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class HttpEventService implements EventService {
  private url = '/api/timeslots/';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.url).pipe(
      catchError(this.handleError('getEvents', []))
    );
  }

  getEventsByDate(start: Date, end: Date): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.url}?start=` + start.toISOString() + '&end=' + end.toISOString()).pipe(
      catchError(this.handleError('getEventsByDate', []))
    );
  }

  createEvents(events: Event[]): Observable<Event[]> {
    return this.http.post<Event[]>(this.url + 'batch', JSON.stringify(events), httpOptions);
  }

  updateEvent(id: number, start: Date, end: Date): Observable<Event> {
    return this.http.patch<Event>(this.url + id, JSON.stringify({start: start, end: end}), httpOptions);
  }

  private handleError<T>(operation = 'operation', result ?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed`, error);
      return Observable.of(result as T);
    };
  }
}
