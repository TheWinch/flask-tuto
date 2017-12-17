import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { EventService, Event } from './event.service';

@Injectable()
export class EventServiceMock implements EventService {
    private repo: Event[] = this.createRepo();

    public getEvents(): Observable<Event[]> {
        return of(this.repo);
    }

    private createRepo(): Event[] {
        const dateObj = new Date();
        const yearMonth = dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1);
        const data: any = [{
            id: 1,
            title: 'All Day Event',
            start: yearMonth + '-01'
        },
        {
            id: 2,
            title: 'Long Event',
            start: yearMonth + '-07',
            end: yearMonth + '-10'
        },
        {
            id: 999,
            title: 'Repeating Event',
            start: yearMonth + '-09T16:00:00'
        },
        {
            id: 999,
            title: 'Repeating Event',
            start: yearMonth + '-16T16:00:00'
        },
        {
            id: 3,
            title: 'Conference',
            start: yearMonth + '-11',
            end: yearMonth + '-13'
        },
        {
            id: 4,
            title: 'Meeting',
            start: yearMonth + '-12T10:30:00',
            end: yearMonth + '-12T12:30:00',
            customerId: 1
        },
        {
            id: 5,
            title: 'Lunch',
            start: yearMonth + '-12T12:00:00'
        },
        {
            id: 6,
            title: 'Meeting',
            start: yearMonth + '-12T14:30:00'
        },
        {
            id: 7,
            title: 'Happy Hour',
            start: yearMonth + '-12T17:30:00'
        },
        {
            id: 8,
            title: 'Dinner',
            start: yearMonth + '-12T20:00:00'
        },
        {
            id: 9,
            title: 'Birthday Party',
            start: yearMonth + '-13T07:00:00'
        },
        {
            id: 10,
            title: 'Click for Google',
            url: 'http://google.com/',
            start: yearMonth + '-28'
        }];
        return data;
    }
};
