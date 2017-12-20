import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarComponent } from './fullcalendar.component';
import { Options } from 'fullcalendar';
import { EventService } from './event.service';

@Component({
  selector: 'osc-timeslots',
  template: `
      <p *ngFor="let msg of messages">
        <ngb-alert [type]="msg.type" (close)="closeAlert(alert)">{{msg.text}}</ngb-alert>
      </p>
    <div *ngIf="calendarOptions">
<osc-fullcalendar #ucCalendar [options]="calendarOptions" 
                 (eventDrop)="onEventDefined($event.detail)"
                 (eventSelect)="onEventDefined($event.detail)"
                 (eventResize)="updateEvent($event.detail)" 
                 ></osc-fullcalendar>
</div>`
})
export class TimeSlotViewComponent implements OnInit {
  calendarOptions: Options;
  @ViewChild(FullCalendarComponent) ucCalendar: FullCalendarComponent;
  messages: IAlert[] = [];
  messageIndex: number = 0;

  updateEvent(event: any): void {
    console.log(`update event`);
    console.log(event);
  }

  closeAlert(alert: any) {
    const index: number = this.messages.indexOf(alert);
    this.messages.splice(index, 1);
  }

  onEventDefined(model: any) {
    const ucCalendar = this.ucCalendar;
    this.eventService.createEvents([model.event]).subscribe(events => {
      this.info('Event has been created, id: ' + events[0].id);
      ucCalendar.fullCalendar('unselect');
      ucCalendar.fullCalendar('refetchEvents'); // this is a bit violent, we could just update whatever events have been collected
    }, error => {
      this.error('Could not create event: ' + error);
      ucCalendar.fullCalendar('unselect');
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
        dow: [ 0, 1, 2, 3, 4, 5, 6 ],
        start: '8:00',
        end: '19:00',
      },
      events: function(start, end, timezone, callback) {
        eventService.getEventsByDate(start, end).subscribe(data => {
          console.log('Received data: ' + JSON.stringify(data));
          callback(data);
        });
      }
    };
  }

  private info(message: string): void {
    this.messages.push({id: this.messageIndex++, text: message, type: 'info'});
    console.log('INFO: ' + message);
  }
  private warn(message: string): void {
    this.messages.push({id: this.messageIndex++, text: message, type: 'warning'});
    console.log('WARN: ' + message);
  }
  private error(message: string): void {
    this.messages.push({id: this.messageIndex++, text: message, type: 'danger'});
    console.log('ERROR: ' + message);
  }

  constructor(protected eventService: EventService) { }

}

export interface IAlert {
  id: number;
  type: string;
  text: string;
}
