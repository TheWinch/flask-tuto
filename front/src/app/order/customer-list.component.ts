import {Component, Input, EventEmitter, Output, ChangeDetectionStrategy} from '@angular/core';

import { Customer } from '../model/customer';
import { CustomerSelection } from '../model/customer-choices';

@Component({
  selector: 'osc-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderCustomerListComponent {
  @Input()
  currentSelection: Customer;
  @Input()
  customerChoices: CustomerSelection[] = [];
  @Output() selected: EventEmitter<Customer> = new EventEmitter<Customer>();
  @Output() removed: EventEmitter<Customer> = new EventEmitter<Customer>();

  constructor() { }

  /**
   * A customer has been selected in the list
   * @param customer selected customer
   */
  onSelect(customer: Customer): void {
    this.currentSelection = customer;
    this.selected.emit(customer);
  }

  onRemove(customer: Customer): void {
    if (this.currentSelection === customer) {
      this.currentSelection = null;
    }
    this.removed.emit(customer);
  }
}
