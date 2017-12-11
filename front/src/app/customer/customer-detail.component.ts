import { Component, Input } from '@angular/core';
import { Customer } from '../model/customer';

@Component({
  selector: 'customer-detail',
  templateUrl: './customer-detail.component.html'
})
export class CustomerDetailComponent {
  @Input() customer: Customer;
}
