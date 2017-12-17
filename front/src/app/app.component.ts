import { Component } from '@angular/core';
import { Customer } from './model/customer';

@Component({
  selector: 'osc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'OSC Gestion de Réservations';
  isNavbarCollapsed = false;
  customer: Customer;

  onCustomerSelected(customer: Customer): void {
    console.log('received customer: ' + JSON.stringify(customer));
    this.customer = customer;
  }
}
