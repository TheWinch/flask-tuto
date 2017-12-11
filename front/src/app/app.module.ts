import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { CustomersComponent } from './customer/customers.component';
import { CustomerDetailComponent } from './customer/customer-detail.component';
import { CustomerService } from './customer.service';
import { CalendarComponent } from './calendar/calendar.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'calendar',
        component: CalendarComponent
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
    CalendarComponent
  ],
  providers: [CustomerService],
  bootstrap: [AppComponent]
})
export class AppModule { }


