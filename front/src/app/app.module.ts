import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {AppComponent} from './app.component';
import {FullCalendarComponent} from './calendar/fullcalendar.component';
import {CustomersComponent} from './customer/customers.component';
import {OrderComponent} from './order/order.component';
import {OrderCustomerListComponent} from './order/customer-list.component';
import {CustomerDetailComponent} from './customer/customer-detail.component';
import {CustomerService, HttpCustomerService} from './services/customer.service';
import {CustomerServiceMock} from './services/customer.service.mock';
import {EventService, HttpEventService} from './services/event.service';
import {EventServiceMock} from './services/event.service.mock';
import {TimeSlotViewComponent} from './calendar/timeslotview.component';
import {CustomerSearchComponent} from './customer/customer-search.component';
import {AppointmentService, HttpAppointmentService} from './services/appointment.service';
import {AppointmentServiceMock} from './services/appointment.service.mock';
import {OrderListComponent} from './order/order-list.component';
import {MessagesComponent} from './messages/messages.component';

import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr, 'fr');

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: 'orders',
        component: OrderListComponent
      },
      {
        path: 'orders/:id',
        component: OrderComponent
      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'calendar',
        component: TimeSlotViewComponent
      },
      {
        path: '',
        redirectTo: '/orders',
        pathMatch: 'full'
      }
    ]),
    NgbModule.forRoot()
    ],
  declarations: [
    AppComponent,
    FullCalendarComponent,
    CustomersComponent,
    CustomerDetailComponent,
    TimeSlotViewComponent,
    OrderComponent,
    OrderCustomerListComponent,
    CustomerSearchComponent,
    OrderListComponent,
    MessagesComponent
  ],
  providers: [
    { provide: CustomerService, useClass: HttpCustomerService },
    { provide: EventService, useClass: HttpEventService },
    { provide: AppointmentService, useClass: HttpAppointmentService },
    // { provide: CustomerService, useValue: new CustomerServiceMock() },
    // { provide: EventService, useValue: new EventServiceMock() },
    // { provide: AppointmentService, useValue: new AppointmentServiceMock() }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


