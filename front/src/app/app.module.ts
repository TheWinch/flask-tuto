import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from "ng-fullcalendar";

import { AppComponent } from './app.component';
import { CustomersComponent } from './customer/customers.component';
import { OrderComponent } from './order/order.component';
import { OrderCustomerListComponent } from './order/customer-list.component';
import { CustomerDetailComponent } from './customer/customer-detail.component';
import { CustomerService } from './customer.service';
import { CustomerServiceMock } from './customer.service.mock';
import { EventService } from './calendar/event.service';
import { EventServiceMock } from './calendar/event.service.mock';
import { MyCalendarComponent } from './calendar/calendar.component';
import { CustomerSearchComponent } from './customer/customer-search.component';

@NgModule({
  imports: [
    BrowserModule,
    FullCalendarModule,
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
        component: MyCalendarComponent
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
    CustomersComponent,
    CustomerDetailComponent,
    MyCalendarComponent,
    OrderComponent,
    OrderCustomerListComponent,
    CustomerSearchComponent
  ],
  providers: [
    { provide: CustomerService, useValue: new CustomerServiceMock() },
    { provide: EventService, useValue: new EventServiceMock() }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


