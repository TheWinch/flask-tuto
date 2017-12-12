import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';
import { EventService } from './event.service';

@Component({
  selector: 'app-calendar',
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
        editable: true,
        //defaultDate: '2016-09-12',
        eventLimit: false,
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,listMonth'
        },
        events: data
      };
    });
  }

  /*
  calendarOptions:Object = {
        height: 'parent',
        fixedWeekCount : false,
        defaultDate: '2016-09-12',
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: 
      };
    let el = {
   title: 'New event'
   start: '2017-10-07',
   url: 'www.google.fr'
   end: '2017-10-10',
   ...
 }
 this.ucCalendar.fullCalendar('renderEvent', el);
 this.ucCalendar.fullCalendar('rerenderEvents');   
      */
   // see https://github.com/Jamaks/ng-fullcalendar
  
  constructor(protected eventService: EventService) { }

}
