import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarComponent } from 'ng-fullcalendar';
import { Options } from 'fullcalendar';

import { Customer } from '../model/customer';
import { EventService } from '../calendar/event.service';

@Component({
  selector: 'osc-front-order',
  templateUrl: './order.component.html',
  styleUrls: ['../calendar/calendar.component.css']
})
export class OrderComponent implements OnInit {
  title: string;
  closeResult: string;
  calendarOptions: Options;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  private calendarData: any = [];
  private currentCustomer: Customer;
  private appointments: any = {};

  constructor(private modalService: NgbModal, private eventService: EventService) { }

  openSaveModal(content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed with: ${reason}`;
    });
  }

  onCustomerSelected(customer: Customer): void {
    console.log('Customer selected: ' + JSON.stringify(customer));
    this.currentCustomer = customer;
    for (const a of this.appointments[customer.id]) {
        this.ucCalendar.fullCalendar('removeEvents', a.id);
        a.backgroundColor = 'red';
        this.ucCalendar.fullCalendar('renderEvent', a);
    }
  }

  onCustomerAdded(customer: Customer): void {
    this.appointments[customer.id] = [];
    console.log('Adding appointments => ' + JSON.stringify(this.appointments));
  }

  eventClick(model: any): void {
    model = {
      event: {
        id: model.event.id,
        start: model.event.start,
        end: model.event.end,
        title: model.event.title,
        allDay: model.event.allDay,
        backgroundColor: 'red'
      },
      duration: {}
    };
    console.log('clicked on event: ' + JSON.stringify(model));
    if (this.currentCustomer == null) {
      return;
    }
    this.appointments[this.currentCustomer.id].push(model.event);
    console.log('New appointments: ' + JSON.stringify(this.appointments));
    // For some reason, updateEvent seems not working
    // this.ucCalendar.fullCalendar('removeEvents', model.event.id);
    // this.ucCalendar.fullCalendar('renderEvent', model.event);
  }

  ngOnInit() {
    this.eventService.getEvents().subscribe(data => {
        this.calendarData = data;
        this.calendarOptions = {
          height: 688,
          defaultView: 'agendaWeek',
          locale: 'fr',
          firstDay: 1,
          minTime: '8:00',
          maxTime: '19:00',
          editable: false,
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
          events: this.calendarData
        };
      });
  }
}
