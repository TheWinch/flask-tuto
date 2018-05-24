import { Component, OnInit, Output, EventEmitter, ElementRef, ViewChild, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {
  debounceTime, distinctUntilChanged, switchMap, tap, map
} from 'rxjs/operators';

import { CustomerService, SearchResult } from '../services/customer.service';
import { Customer } from '../model/customer';
import { of } from 'rxjs/observable/of';
import { PAGE_SIZE } from '../utils/pagination';

@Component({
  selector: 'osc-customer-search',
  templateUrl: './customer-search.component.html',
  styles: []
})
export class CustomerSearchComponent implements OnInit {
  // New customer creation fields
  newCustomer: Customer;

  // Emitted when the user selects or creates a customer
  @Input() public excluded: number[] = [];
  @Output() public selected: EventEmitter<Customer> = new EventEmitter<Customer>();

  // Search list management
  searchResults$: Observable<Customer[]>;
  searchPage = 1;
  searchSize = 0;
  pageSize = 5;
  currentSearchTerm = '';
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
    this.resetSearch();
  }

  search(term: string): void {
    if (term) {
      this.searchTerms.next(term);
    } else {
      this.resetSearch();
    }
  }

  onPreviousPage(): void {
    this.searchPage -= 1;
    this.searchResults$ = this.customerService.searchCustomers(this.currentSearchTerm, this.searchPage, this.pageSize).pipe(
      map((result: SearchResult) => result.customers)
    );
  }

  onNextPage(): void {
    this.searchPage += 1;
    this.searchResults$ = this.customerService.searchCustomers(this.currentSearchTerm, this.searchPage, this.pageSize).pipe(
      map((result: SearchResult) => result.customers)
    );
  }

  isExcluded(customer): boolean {
    return this.excluded.some(id => customer.id === id);
  }

  private resetSearch() {
    this.searchSize = 0;
    this.currentSearchTerm = '';
    this.searchPage = 1;
    // This will reset the search list
    this.searchBox.nativeElement.value = '';
    // This resets the search results and hides the search list
    this.getCustomers();
  }

  private getCustomers(): void {
    this.searchResults$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => {
        this.searchPage = 1;
        this.currentSearchTerm = term;
        return this.customerService.searchCustomers(term, this.searchPage, this.pageSize);
      }),
      tap((result: SearchResult) => {
        this.searchSize = result.totalCount;
      }),
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
