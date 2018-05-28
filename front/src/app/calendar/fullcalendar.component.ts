import { Component, Input, Output, OnInit, AfterViewInit, AfterContentChecked,
  AfterViewChecked, ElementRef, EventEmitter } from '@angular/core';
import $ from 'jquery';
import 'fullcalendar';
import { Options } from 'fullcalendar';

export class ButtonClickModel {
  buttonType: string;
  data: any;
}
export class UpdateEventModel {
  event: any;
  duration: any;
  revertFunc?: any;
}

@Component({
  selector: 'osc-fullcalendar',
  template: '<div id="calendar"></div>'
})
export class FullCalendarComponent implements OnInit, AfterViewInit, AfterContentChecked, AfterViewChecked {
  @Input() options: Options;
  @Output() eventDrop = new EventEmitter<any>();
  @Output() eventResize = new EventEmitter<any>();
  @Output() eventClick = new EventEmitter<any>();
  @Output() eventSelect = new EventEmitter<any>();
  @Output() clickButton = new EventEmitter<any>();
  @Output() windowResize = new EventEmitter<any>();
  @Output() viewRender = new EventEmitter<any>();
  @Output() viewDestroy = new EventEmitter<any>();
  text: string;

  constructor(private element: ElementRef) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updaterOptions();
      $('osc-fullcalendar').fullCalendar(this.options);

      // Click listeners
      const elem = document.getElementsByTagName('osc-fullcalendar');

      $('[class ^="fc"][class *="button"]').click(el => {
        const classnames = el.currentTarget.className.split(' ');
        classnames.forEach(name => {
          if (name.indexOf('button') === name.length - 6) {
            name = name.replace(/fc|button|-/g, '');
            if (name !== '') {
              eventDispatch(name);
            }
          }
        });
      });

      function eventDispatch(buttonType: string) {
        const data = $('osc-fullcalendar').fullCalendar('getDate');
        const currentDetail: ButtonClickModel = {
          buttonType: buttonType,
          data: data
        };
        const widgetEvent = new CustomEvent('clickButton', {
          bubbles: true,
          detail: currentDetail
        });
        elem[0].dispatchEvent(widgetEvent);
      }
    }, 100);
  }
  ngAfterContentChecked() {
  }
  ngAfterViewChecked() {
  }
  updaterOptions() {
    const elem = document.getElementsByTagName('osc-fullcalendar');
    this.options.eventDrop = function (event, duration, revertFunc) {
      const detail: UpdateEventModel = { event: event, duration: duration, revertFunc: revertFunc };
      const widgetEvent = new CustomEvent('eventDrop', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventResize = function (event, duration, revertFunc) {
      const detail: UpdateEventModel = { event: event, duration: duration, revertFunc: revertFunc };
      const widgetEvent = new CustomEvent('eventResize', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventClick = function (event) {
      const detail: UpdateEventModel = { event: event, duration: null };
      const widgetEvent = new CustomEvent('eventClick', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.windowResize = function (view) {
      const detail = { view: view };
      const widgetEvent = new CustomEvent('windowResize', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.viewRender = function (view, element) {
      const detail = { view: view, element: element };
      const widgetEvent = new CustomEvent('viewRender', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.viewDestroy = function (view, element) {
      const detail = { view: view, element: element };
      const widgetEvent = new CustomEvent('viewDestroy', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.select = function(start, end) {
      const detail = { event: {start: start, end: end}, duration: null };
      const widgetEvent = new CustomEvent('eventSelect', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
  }

  fullCalendar(...args: any[]) {
    if (!args) {
      return;
    }
    switch (args.length) {
      case 0:
        return;
      case 1:
        return $(this.element.nativeElement).fullCalendar(args[0]);
      case 2:
        return $(this.element.nativeElement).fullCalendar(args[0], args[1]);
      case 3:
        return $(this.element.nativeElement).fullCalendar(args[0], args[1], args[2]);
    }
  }

  updateEvent(event: any) {
    return $(this.element.nativeElement).fullCalendar('updateEvent', event);
  }

  clientEvents(idOrFilter: any): any {
    return $(this.element.nativeElement).fullCalendar('clientEvents', idOrFilter);
  }
}
