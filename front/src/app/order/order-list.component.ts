import {Component, OnInit, ViewChild} from '@angular/core';
import {Appointment, AppointmentService, Order} from "../calendar/appointment.service";
import {MessagesComponent} from "../messages/messages.component";
import {DatePipe} from "@angular/common";
import { Observable } from 'rxjs/Observable';
import { concat } from 'rxjs/observable/concat';
import { Subject }    from 'rxjs/Subject';

import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';

@Component({
  selector: 'osc-order-list',
  templateUrl: './order-list.component.html',
  styles: []
})
export class OrderListComponent implements OnInit {
  private searchTerms = new Subject<string>();
  orders$: Observable<Order[]>;
  selectedOrder: Order = null;
  page = 1;
  @ViewChild(MessagesComponent) messageList: MessagesComponent;

  constructor(private appointmentService: AppointmentService) { }

  ngOnInit() {
    this.orders$ = concat(
      this.appointmentService.getOrders(),
      this.searchTerms.pipe(
        // wait 300ms after each keystroke before considering the term
        debounceTime(300),

        // ignore new term if same as previous term
        distinctUntilChanged(),

        // switch to new search observable each time the term changes
        switchMap((term: string) => this.appointmentService.searchOrders(+term))
      ));
  }

  createOrder(): void {
    this.selectedOrder = {
      title: new DatePipe('fr').transform(new Date(), 'full'),
      appointments: []
    };
  }

  editOrder(order: Order): void {
    this.selectedOrder = order;
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  customerNames(appointments: Appointment[]): any {
    return Array.from(new Set(appointments.map(a => '' + a.customerId)));
  }

  onOrderCreated(order: Order): void {
    this.messageList.info('La commande ' + order.title + ' a été créée.');
    this.selectedOrder = null;
  }
  onOrderAborted(): void {
    this.selectedOrder = null;
  }

}
