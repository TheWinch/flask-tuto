import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Observable, Subject, concat } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap, map, tap
 } from 'rxjs/operators';

import { Customer } from '../model/customer';
import { CustomerService, SearchResult } from '../services/customer.service';
import { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { PAGE_SIZE } from '../utils/pagination';
import { CustomerAddComponent } from './customer-add.component';
import { CustomerDeleteComponent } from './customer-delete.component';


@Component({
  selector: 'osc-customers',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  customers$: Observable<Customer[]>;
  page = 1;
  pageSize = PAGE_SIZE;
  collectionSize = 0;
  searchTerm = '';
  private searchTerms = new Subject<string>();

  constructor(private modalService: NgbModal, private customerService: CustomerService,
              private router: Router) { }

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.getCustomers();
  }

  showCustomerCreationModal(content) {
    this.modalService.open(CustomerAddComponent, {size: 'lg'});
  }

  deleteCustomer(customer: Customer): void {
    const modalRef = this.modalService.open(CustomerDeleteComponent, {size: 'sm'});
    modalRef.componentInstance.customer = customer;
    modalRef.result.then(
      (result) => this.getCustomers(),
      (reason) => {} // the promise fails to resolve if we don't provide a callback for cancellation
    );
  }

  getCustomers(): void {
    this.customers$ = concat(
      this.customerService.searchCustomers(this.searchTerm, this.page, this.pageSize),
      this.searchTerms.pipe(
        // wait 300ms after each keystroke before considering the term
        debounceTime(300),

        // ignore new term if same as previous term
        distinctUntilChanged(),

        // switch to new search observable each time the term changes
        switchMap((term: string) => {
          this.page = 1;
          this.searchTerm = term.trim();
          return this.customerService.searchCustomers(this.searchTerm, this.page, this.pageSize);
        }))
    ).pipe(
      tap((res: SearchResult) => this.collectionSize = res.totalCount),
      map((res: SearchResult) => res.customers)
    );
  }

  onPageChange(newPage: number): void {
    this.getCustomers();
  }
}
