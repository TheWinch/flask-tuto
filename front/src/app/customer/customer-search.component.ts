import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';

import {
  debounceTime, distinctUntilChanged, switchMap, tap
} from 'rxjs/operators';

import { CustomerService } from '../customer.service';
import { ProtoCustomer, Customer } from '../model/customer';
import { initNgModule } from '@angular/core/src/view/ng_module';

@Component({
  selector: 'osc-customer-search',
  templateUrl: './customer-search.component.html',
  styles: []
})
export class CustomerSearchComponent implements OnInit {
  // New customer creation fields
  newCustomer: ProtoCustomer;

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
    console.log('Customer has been selected: ' + JSON.stringify(customer));
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
      switchMap((term: string) => this.customerService.searchCustomers(term))
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
