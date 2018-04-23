import {Component, Input, EventEmitter, Output, ChangeDetectionStrategy} from '@angular/core';

import { Customer } from '../model/customer';
import { CustomerChoices } from '../model/order';

@Component({
  selector: 'osc-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCustomerListComponent {
  @Input()
  currentSelection: Customer;
  @Input()
  customerChoices: CustomerChoices[] = [];
  @Output() selected: EventEmitter<Customer> = new EventEmitter<Customer>();

  constructor() { }

  /**
   * A customer has been selected in the list
   * @param customer selected customer
   */
  onSelect(customer: Customer): void {
    this.currentSelection = customer;
    this.selected.emit(customer);
  }
}
