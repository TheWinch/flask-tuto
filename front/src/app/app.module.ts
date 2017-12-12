import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FullCalendarModule } from "ng-fullcalendar";

import { AppComponent } from './app.component';
import { CustomersComponent } from './customer/customers.component';
import { CustomerDetailComponent } from './customer/customer-detail.component';
import { CustomerService } from './customer.service';
import { EventService } from './calendar/event.service';
import { MyCalendarComponent } from './calendar/calendar.component';

@NgModule({
  imports: [
    BrowserModule,
    FullCalendarModule,
    HttpClientModule,
    RouterModule.forRoot([
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
        redirectTo: '/calendar',
        pathMatch: 'full'
      }
    ]),
    NgbModule.forRoot()
    ],
  declarations: [
    AppComponent,
    CustomersComponent,
    CustomerDetailComponent,
    MyCalendarComponent
  ],
  providers: [CustomerService, EventService],
  bootstrap: [AppComponent]
})
export class AppModule { }


