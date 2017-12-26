import {Component, OnInit, ViewChild} from "@angular/core";
import {DatePipe} from "@angular/common";

import {FullCalendarComponent} from "./fullcalendar.component";
import {MessagesComponent} from "../messages/messages.component";

import {Options} from "fullcalendar";
import {EventService} from "../services/event.service";

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
  calendarOptions: Options;
  @ViewChild(FullCalendarComponent) ucCalendar: FullCalendarComponent;
  @ViewChild(MessagesComponent) messageList: MessagesComponent;

  updateEvent(model: any): void {
    const ucCalendar = this.ucCalendar;
    this.ucCalendar.fullCalendar('unselect');
    this.eventService.updateEvent(model.event.id, model.event.start, model.event.end).subscribe(data => {
      ucCalendar.fullCalendar('refetchEvents');
    }, error => {
      this.messageList.error('Echec de la mise à jour du créneau: ' + error);
    })
  }

  onEventDefined(model: any) {
    const ucCalendar = this.ucCalendar;
    ucCalendar.fullCalendar('unselect');
    let datePipe = new DatePipe('fr');
    this.eventService.createEvents([Object.assign({}, model.event, {capacity: 8})])
      .subscribe(events => {
        this.messageList.info('Un créneau a été créé le ' + datePipe.transform(events[0].start, 'dd/MM/yyyy') + ' de ' + datePipe.transform(events[0].start, 'hh:mm') + ' à ' + datePipe.transform(events[0].end, 'hh:mm'));
        ucCalendar.fullCalendar('refetchEvents'); // this is a bit violent, we could just update whatever events have been collected
      });
  }

  ngOnInit() {
    const eventService = this.eventService;
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
      events: function (start, end, timezone, callback) {
        eventService.getEventsByDate(start, end).subscribe(data => {
          data.forEach(e => {
            // The calendar object is shared by all the views, so we must reset any coloring (should rather be done by
            // the order view)
            Object.assign(e, {
              borderColor: '',
              backgroundColor: ''
          })
          });
          callback(data);
        });
      }
    };
  }

  constructor(protected eventService: EventService) {
  }

}

