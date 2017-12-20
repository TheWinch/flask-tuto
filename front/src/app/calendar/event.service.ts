import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export class Event {
    id: number;
    title?: string;
    start: string | Date;
    end?: string | Date;
    capacity?: number;
}

export abstract class EventService {
    abstract getEvents(): Observable<Event[]>;
    abstract getEventsByDate(start: Date, end: Date): Observable<Event[]>;
    abstract createEvents(model: Event[]): Observable<Event[]>;
}
