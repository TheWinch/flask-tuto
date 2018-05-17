import {ReplaySubject} from 'rxjs/ReplaySubject';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderEditComponent } from './order-edit.component';
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
import { ActivatedRouteStub } from '../test-utils/activated-route-stub';

describe('OrderComponent', () => {
  let component: OrderEditComponent;
  let fixture: ComponentFixture<OrderEditComponent>;
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
        OrderEditComponent,
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
    fixture = TestBed.createComponent(OrderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
