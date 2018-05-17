import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerEditComponent } from './customer-edit.component';
import { ActivatedRouteStub } from '../test-utils/activated-route-stub';
import { of } from 'rxjs/observable/of';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { Router, ActivatedRoute } from '@angular/router';

describe('CustomerEditComponent', () => {
  let component: CustomerEditComponent;
  let fixture: ComponentFixture<CustomerEditComponent>;
  const activatedRoute = new ActivatedRouteStub({id: 'new'});

  beforeEach(async(() => {
    const customerServiceStub = jasmine.createSpyObj('CustomerService', ['getCustomer', 'createCustomer', 'updateCustomer']);
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
        CustomerEditComponent,
      ],
      imports: [FormsModule],
      providers: [
        {provide: CustomerService, useValue: customerServiceStub},
        {provide: Router, useValue: routerSpy},
        {provide: ActivatedRoute, useValue: activatedRoute}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
