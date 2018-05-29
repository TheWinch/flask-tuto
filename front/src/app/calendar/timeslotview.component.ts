import {Component, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';

import {FullCalendarComponent} from './fullcalendar.component';
import {MessagesComponent} from '../messages/messages.component';

import {OptionsInput} from 'fullcalendar';
import {EventService} from '../services/event.service';
import {Event} from '../model/event';

@Component({
  selector: 'osc-timeslots',
  template: `
    <osc-messages></osc-messages>
    <div *ngIf="calendarOptions">
      <osc-fullcalendar #ucCalendar [options]="calendarOptions"
                        (eventDrop)="updateEvent($event.detail)"
                        (eventSelect)="onEventDefined($event.detail)"
                        (eventResize)="updateEvent($event.detail)"
      ></osc-fullcalendar>
    </div>`
})
export class TimeSlotViewComponent implements OnInit {
  calendarOptions: OptionsInput;
  @ViewChild(FullCalendarComponent) ucCalendar: FullCalendarComponent;
  @ViewChild(MessagesComponent) messageList: MessagesComponent;
  private readonly frozenNow = moment(new Date());

  private static colorEvent(event: Event, now: moment.Moment): string {
    if (event.used === event.capacity || now.isAfter(event.end)) {
      return 'grey';
    } else if (event.used === event.capacity - 1) {
      return 'red';
    } else if (event.used > event.capacity / 2) {
      return 'orange';
    } else  {
      return 'green';
    }
  }

  updateEvent(model: any): void {
    const ucCalendar = this.ucCalendar;
    this.ucCalendar.fullCalendar('unselect');
    if (this.frozenNow.isBefore(model.event.end)) {
      this.eventService.updateEvent(model.event.id, model.event.start, model.event.end).subscribe(data => {
        ucCalendar.fullCalendar('refetchEvents');
      }, error => {
        this.messageList.error('Echec de la mise à jour du créneau: ' + error);
      });
    } else {
      model.revertFunc();
    }
  }

  onEventDefined(model: any) {
    const ucCalendar = this.ucCalendar;
    ucCalendar.fullCalendar('unselect');
    if (this.frozenNow.isBefore(model.event.end)) {
      const datePipe = new DatePipe('fr');
      this.eventService.createEvents([Object.assign({}, model.event, {capacity: 8})])
        .subscribe(events => {
          const createDate = datePipe.transform(events[0].start, 'dd/MM/yyyy');
          const startTime = datePipe.transform(events[0].start, 'hh:mm');
          const endTime = datePipe.transform(events[0].end, 'hh:mm');
          this.messageList.info('Un créneau a été créé le ' + createDate + ' de ' + startTime + ' à ' + endTime);
          ucCalendar.fullCalendar('refetchEvents'); // this is a bit violent, we could just update whatever events have been collected
        });
    } else {
      if (model.revertFunc != null) {
        model.revertFunc();
      }
    }
  }

  ngOnInit() {
    const eventService = this.eventService;
    const now = this.frozenNow;
    this.calendarOptions = {
      height: 688,
      defaultView: 'agendaWeek',
      locale: 'fr',
      firstDay: 1,
      minTime: '8:00',
      maxTime: '19:00',
      editable: true,
      selectable: true,
      selectHelper: true,
      eventLimit: false,
      header: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      allDaySlot: false,
      businessHours: {
        dow: [0, 1, 2, 3, 4, 5, 6],
        start: '8:00',
        end: '19:00',
      },
      views: {
        agendaWeek: {
          columnHeaderFormat: 'ddd D/M'
        }
      },
      events: function (start, end, timezone, callback) {
        eventService.getEventsByDate(start.toDate(), end.toDate()).subscribe(data => {
          data.forEach(e => {
            // The calendar object is shared by all the views, so we must reset any coloring (should rather be done by
            // the order view)
            Object.assign(e, {
              borderColor: '',
              backgroundColor: TimeSlotViewComponent.colorEvent(e, now),
              title: e.used + '/' + e.capacity + ' client' + (e.used !== 1 ? 's' : '')
          });
          });
          callback(data);
        });
      }
    };
  }

  constructor(protected eventService: EventService) {
  }

}

