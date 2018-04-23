import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { concat } from 'rxjs/observable/concat';
import { Subject } from 'rxjs/Subject';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Customer } from '../model/customer';
import { CustomerService } from '../services/customer.service';
import {MonoTypeOperatorFunction, OperatorFunction} from 'rxjs/interfaces';


@Component({
  selector: 'osc-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers$: Observable<Customer[]>;
  page = 1;
  private searchTerms = new Subject<string>();

  constructor(private customerService: CustomerService) { }

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.getCustomers();
  }

  createCustomer(): void {
  }

  deleteCustomer(customer: Customer): void {
  }

  getCustomers(): void {
     this.customers$ = concat(
        this.customerService.getCustomers(),
        this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => {
        if (term != null && term.trim() !== '') {
          return this.customerService.searchCustomers(term);
        } else {
          return Observable.of([]);
        }
      })
    ));
  }
}
