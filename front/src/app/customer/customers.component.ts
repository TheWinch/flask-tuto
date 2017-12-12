import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';
import { of }         from 'rxjs/observable/of';
 
import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Customer } from '../model/customer';
import { CustomerService } from '../customer.service';

@Component({
  selector: 'customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers$: Observable<Customer[]>;
  private searchTerms = new Subject<string>();
  selectedCustomer: Customer;

  constructor(private customerService: CustomerService) { }

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.getCustomers();
  }

  onSelect(customer: Customer): void {
    this.selectedCustomer = customer;
  }

  getCustomers(): void {
    this.customers$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
 
      // ignore new term if same as previous term
      distinctUntilChanged(),
 
      // switch to new search observable each time the term changes
      switchMap((term: string) => this.customerService.searchCustomers(term)),
    );
    //this.customerService.getCustomers()
    //    .subscribe(customers => this.customers = customers);
  }
}
