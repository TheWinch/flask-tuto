import {ReplaySubject} from 'rxjs/ReplaySubject';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderComponent } from './order.component';
import { FullCalendarComponent } from '../calendar/fullcalendar.component';
import { CustomerSearchComponent } from '../customer/customer-search.component';
import { OrderCustomerListComponent } from './customer-list.component';
import { FormsModule } from '@angular/forms';
import { EventService } from '../services/event.service';
import { AppointmentService } from '../services/appointment.service';
import { CustomerService } from '../services/customer.service';
import { of } from 'rxjs/observable/of';
import { Router, ActivatedRouteSnapshot, ParamMap, Params, convertToParamMap, ActivatedRoute } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * An ActivateRoute test double with a `paramMap` observable.
 * Use the `setParamMap()` method to add the next `paramMap` value.
 */
export class ActivatedRouteStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `paramMap` observable
  private subject = new ReplaySubject<ParamMap>();

  constructor(initialParams?: Params) {
    this.setParamMap(initialParams);
  }

  /** The mock paramMap observable */
  readonly paramMap = this.subject.asObservable();

  /** Set the paramMap observables's next value */
  setParamMap(params?: Params) {
    this.subject.next(convertToParamMap(params));
  }
}

describe('OrderComponent', () => {
  let component: OrderComponent;
  let fixture: ComponentFixture<OrderComponent>;
  const activatedRoute = new ActivatedRouteStub({id: 'new'});

  beforeEach(async(() => {
    const eventServiceStub = jasmine.createSpyObj('EventService', ['getEvents']);
    const getEventsSpy = eventServiceStub.getEvents.and.returnValue(of([]));
    const appointmentServiceStub = jasmine.createSpyObj('AppointmentService', ['getOrder', 'createOrder']);
    const customerServiceStub = jasmine.createSpyObj('CustomerService', ['getCustomer']);
    const getCustomerSpy = customerServiceStub.getCustomer.and.returnValue(of(
      {
        id: 1,
        firstName: 'V',
        lastName: 'GR',
        email: 'a@a.a',
        phone: '123'
      }));
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    TestBed.configureTestingModule({
      declarations: [
        OrderComponent,
        FullCalendarComponent,
        OrderCustomerListComponent,
        CustomerSearchComponent
      ],
      imports: [FormsModule, NgbModule.forRoot()],
      providers: [
        {provide: EventService, useValue: eventServiceStub},
        {provide: AppointmentService, useValue: appointmentServiceStub},
        {provide: CustomerService, useValue: customerServiceStub},
        {provide: Router, useValue: routerSpy},
        {provide: ActivatedRoute, useValue: activatedRoute}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
