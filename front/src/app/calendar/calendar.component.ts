import { Component, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import { EventService } from './event.service';

@Component({
  selector: 'osc-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class MyCalendarComponent implements OnInit {
  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  eventClick(event: any): void {
    console.log(`clicked on event: ${event}`);
    console.log(event);
  }
  updateEvent(event: any): void {
    console.log(`update event: ${event}`);
    console.log(event);
  }
  clickButton(button: any): void {
    console.log(`clicked on button: ${button}`);
    console.log(button);
  }

  ngOnInit() {
    this.eventService.getEvents().subscribe(data => {
      this.calendarOptions = {
        height: 688,
        defaultView: 'agendaWeek',
        locale: 'fr',
        firstDay: 1,
        defaultDate: '2016-08-01',
        minTime: '8:00',
        maxTime: '19:00',
        editable: true,
        eventLimit: false,
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,listMonth'
        },
        businessHours: {
          dow: [ 0, 1, 2, 3, 4, 5, 6 ],
            start: '8:00',
            end: '19:00',
          },
          events: data
      };
    });
  }
/* let el = {
   title: 'New event'
   start: '2017-10-07',
   url: 'www.google.fr'
   end: '2017-10-10',
   ...
 }
 this.ucCalendar.fullCalendar('renderEvent', el);
 this.ucCalendar.fullCalendar('rerenderEvents');
   // see https://github.com/Jamaks/ng-fullcalendar
      */

  constructor(protected eventService: EventService) { }

}
