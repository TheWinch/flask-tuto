import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { FullCalendarComponent } from './calendar/fullcalendar.component';
import { TimeSlotViewComponent } from './calendar/timeslotview.component';
import { CustomerListComponent } from './customer/customer-list.component';
import { CustomerEditComponent } from './customer/customer-edit.component';
import { CustomerDetailComponent } from './customer/customer-detail.component';
import { CustomerSearchComponent } from './customer/customer-search.component';
import { OrderEditComponent } from './order/order-edit.component';
import { OrderListComponent } from './order/order-list.component';
import { OrderCustomerListComponent } from './order/customer-list.component';
import { CustomerService, HttpCustomerService } from './services/customer.service';
import { CustomerServiceMock } from './services/customer.service.mock';
import { EventService, HttpEventService } from './services/event.service';
import { EventServiceMock } from './services/event.service.mock';
import { AppointmentService, HttpAppointmentService } from './services/appointment.service';
import { AppointmentServiceMock } from './services/appointment.service.mock';
import { MessagesComponent } from './messages/messages.component';
import { InlineEditorComponent } from './utils/inline-editor.component';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { CustomerAddComponent } from './customer/customer-add.component';
import { CustomerDeleteComponent } from './customer/customer-delete.component';

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
        component: OrderEditComponent
      },
      {
        path: 'customers',
        component: CustomerListComponent
      },
      {
        path: 'customers/:id',
        component: CustomerEditComponent
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
    NgbModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    FullCalendarComponent,
    MessagesComponent,
    InlineEditorComponent,
    CustomerListComponent,
    CustomerEditComponent,
    CustomerAddComponent,
    CustomerDeleteComponent,
    CustomerDetailComponent,
    TimeSlotViewComponent,
    OrderListComponent,
    OrderEditComponent,
    OrderCustomerListComponent,
    CustomerSearchComponent,
  ],
  entryComponents: [
    CustomerAddComponent,
    CustomerDeleteComponent,
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


