import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export class Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    url: string;
}

export abstract class EventService {
    abstract getEvents(): Observable<Event[]>;
}
