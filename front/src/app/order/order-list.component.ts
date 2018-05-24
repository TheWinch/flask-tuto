import {Component, OnInit, ViewChild} from '@angular/core';
import {MessagesComponent} from '../messages/messages.component';
import {AppointmentService, SearchOrdersResult} from '../services/appointment.service';
import {Appointment, Order} from '../model/order';
import {DatePipe} from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { concat } from 'rxjs/observable/concat';
import { tap, map } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { PAGE_SIZE } from '../utils/pagination';

@Component({
  selector: 'osc-order-list',
  templateUrl: './order-list.component.html',
  styles: []
})
export class OrderListComponent implements OnInit {
  private searchTerms = new Subject<string>();
  orders$: Observable<Order[]>;
  collectionSize = 0;
  page = 1;
  pageSize = PAGE_SIZE;
  searchTerm = '';
  @ViewChild(MessagesComponent) messageList: MessagesComponent;

  constructor(private appointmentService: AppointmentService,
              private router: Router,
              private route: ActivatedRoute) { }

  private getPage() {
    // Orders will be updated by the initial search AND any of the subsequent searches triggered by the
    // search terms
    this.orders$ = concat(this.appointmentService.searchOrders(this.page, this.pageSize, this.searchTerm),
    this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // ignore new term if same as previous term
      distinctUntilChanged(),
      // switch to new search observable each time the term changes
      switchMap((term: string) => {
        this.page = 1;
        this.searchTerm = term;
        return this.appointmentService.searchOrders(this.page, this.pageSize, this.searchTerm);
      }))
    ).pipe(
      tap((res: SearchOrdersResult) => this.collectionSize = res.totalCount),
      map((res: SearchOrdersResult) => res.orders)
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      params => {
        if (params['title'] != null) {
          this.messageList.info('La commande ' + params['title'] + ' a été créée.');
        }
      }
    );
    this.getPage();
  }

  createOrder(): void {
    this.router.navigate(['orders', 'new']);
  }

  editOrder(order: Order): void {
    this.router.navigate(['orders', order.id]);
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  customerNames(appointments: Appointment[]): any {
    return Array.from(new Set(appointments.map(a => '' + a.customerId)));
  }

  onPageChange(newPage: number): void {
    this.getPage();
  }

}
