import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { FullCalendarComponent } from './calendar/fullcalendar.component';
import { CustomersComponent } from './customer/customers.component';
import { OrderComponent } from './order/order.component';
import { OrderCustomerListComponent } from './order/customer-list.component';
import { CustomerDetailComponent } from './customer/customer-detail.component';
import { CustomerService } from './customer.service';
import { CustomerServiceMock } from './customer.service.mock';
import { EventService } from './calendar/event.service';
import { EventServiceMock } from './calendar/event.service.mock';
import { TimeSlotViewComponent } from './calendar/timeslotview.component';
import { CustomerSearchComponent } from './customer/customer-search.component';
import { AppointmentService } from "./calendar/appointment.service";
import { AppointmentServiceMock } from "./calendar/appointment.service.mock";

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: 'orders',
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
    CustomerSearchComponent
  ],
  providers: [
    { provide: CustomerService, useValue: new CustomerServiceMock() },
    { provide: EventService, useValue: new EventServiceMock() },
    { provide: AppointmentService, useValue: new AppointmentServiceMock() }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


