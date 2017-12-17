import { Component, OnInit, EventEmitter, Output  } from '@angular/core';

import { Customer } from '../model/customer';
import { CustomerService } from '../customer.service';

@Component({
  selector: 'osc-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class OrderCustomerListComponent {
  selectedCustomer: Customer;
  orderCustomers: Customer[] = [];
  @Output() selected: EventEmitter<Customer> = new EventEmitter<Customer>();
  @Output() customerAdded: EventEmitter<Customer> = new EventEmitter<Customer>();

  constructor() { }

  /**
   * A customer has been selected in the list
   * @param customer selected customer
   */
  onSelect(customer: Customer): void {
    this.selectedCustomer = customer;
    this.selected.emit(customer);
  }

  /**
   * A customer has been added to the list
   * @param customer added customer
   */
  onCustomerAdded(customer: Customer): void {
    console.log('New customer pushed into order: ' + JSON.stringify(customer));
    this.orderCustomers.push(customer);
    this.customerAdded.emit(customer);
  }
}
