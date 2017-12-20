import { Component, Input, Output, OnInit, AfterViewInit, AfterContentChecked, AfterViewChecked, ElementRef, EventEmitter } from '@angular/core';
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
      let elem = document.getElementsByTagName('osc-fullcalendar');

      $('[class ^="fc"][class *="button"]').click(el => {
        let classnames = el.currentTarget.className.split(' ');
        classnames.forEach(name => {
          if (name.indexOf('button') == name.length - 6) {
            name = name.replace(/fc|button|-/g, '');
            if (name != '') {
              eventDispatch(name);
            }
          }
        });
      });

      function eventDispatch(buttonType: string) {
        let data = $('osc-fullcalendar').fullCalendar('getDate');
        let currentDetail: ButtonClickModel = {
          buttonType: buttonType,
          data: data
        };
        var widgetEvent = new CustomEvent('clickButton', {
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
    let elem = document.getElementsByTagName('osc-fullcalendar');
    this.options.eventDrop = function (event, duration) {
      let detail: UpdateEventModel = { event: event, duration: duration };
      var widgetEvent = new CustomEvent('eventDrop', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventResize = function (event, duration) {
      let detail: UpdateEventModel = { event: event, duration: duration };
      var widgetEvent = new CustomEvent('eventResize', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventClick = function (event) {
      let detail: UpdateEventModel = { event: event, duration: null };
      var widgetEvent = new CustomEvent('eventClick', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.windowResize = function (view) {
      let detail = { view: view };
      var widgetEvent = new CustomEvent('windowResize', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.viewRender = function (view, element) {
      let detail = { view: view, element: element };
      var widgetEvent = new CustomEvent('viewRender', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.viewDestroy = function (view, element) {
      let detail = { view: view, element: element };
      var widgetEvent = new CustomEvent('viewDestroy', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.select = function(start, end) {
      let detail = { event:{start: start, end:end}, duration: null };
      let widgetEvent = new CustomEvent('eventSelect', {
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
