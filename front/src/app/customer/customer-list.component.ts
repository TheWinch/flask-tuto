import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { concat } from 'rxjs/observable/concat';
import { Subject } from 'rxjs/Subject';

import {
   debounceTime, distinctUntilChanged, switchMap, map, tap
 } from 'rxjs/operators';

import { Customer } from '../model/customer';
import { CustomerService, SearchResult } from '../services/customer.service';
import {MonoTypeOperatorFunction, OperatorFunction} from 'rxjs/interfaces';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';


@Component({
  selector: 'osc-customers',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers$: Observable<Customer[]>;
  page = 1;
  pageSize = 4;
  collectionSize = 0;
  searchTerm = '';
  private searchTerms = new Subject<string>();
  newCustomer: Customer;

  constructor(private modalService: NgbModal, private customerService: CustomerService,
              private router: Router) { }

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.getCustomers();
    this.resetCustomerTemplate();
  }

  showCustomerCreationModal(content) {
    this.modalService.open(content, {size: 'lg'}).result.then((result) => {
      this.customerService.createCustomer(this.newCustomer).subscribe(res => {
        //this.resetCustomerTemplate();
        this.router.navigate(['customers', res.id]);
      }, err => {
        console.log('An error occured while creating the customer: ' + err);
      });
    }, (reason) => {
    });
  }


  deleteCustomer(customer: Customer): void {
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
      })
    )).pipe(
      tap((res: SearchResult) => this.collectionSize = res.totalCount),
      map((res: SearchResult) => res.customers)
    );
  }

  onPageChange(newPage: number): void {
    this.getCustomers();
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
