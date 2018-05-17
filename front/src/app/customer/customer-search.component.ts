import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {
  debounceTime, distinctUntilChanged, switchMap, tap, map
} from 'rxjs/operators';

import { CustomerService, SearchResult } from '../services/customer.service';
import { Customer } from '../model/customer';

@Component({
  selector: 'osc-customer-search',
  templateUrl: './customer-search.component.html',
  styles: []
})
export class CustomerSearchComponent implements OnInit {
  // New customer creation fields
  newCustomer: Customer;

  // Emitted when the user selects or creates a customer
  @Output() public selected: EventEmitter<Customer> = new EventEmitter<Customer>();

  // Search list management
  searchResults$: Observable<Customer[]>;
  private searchTerms = new Subject<string>();
  @ViewChild('searchBox') searchBox: ElementRef;

  constructor(private modalService: NgbModal, private customerService: CustomerService) { }

  ngOnInit() {
    this.resetCustomerTemplate();
    this.getCustomers();
  }

  showCustomerCreationModal(content) {
    this.modalService.open(content, {size: 'lg'}).result.then((result) => {
      this.customerService.createCustomer(this.newCustomer).subscribe(res => {
        this.resetCustomerTemplate();
        this.onSelect(res);
      }, err => {
        console.log('An error occured while creating the customer: ' + err);
      });
    }, (reason) => {
    });
  }

  onSelect(customer: Customer): void {
    this.selected.next(customer);
    // This will reset the search list
    this.searchBox.nativeElement.value = '';
    this.searchTerms.next('');
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  private getCustomers(): void {
    this.searchResults$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.customerService.searchCustomers(term)),
      map((result: SearchResult) => result.customers)
    );
  }

  private resetCustomerTemplate(): void {
    this.newCustomer = {
      firstName: '',
      lastName: '',
      phone: '',
      email: ''
    };
  }
}
