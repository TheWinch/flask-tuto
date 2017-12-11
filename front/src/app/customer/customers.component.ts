import { Component, OnInit } from '@angular/core';
import { Customer } from '../model/customer';
import { CustomerService } from '../customer.service';

@Component({
  selector: 'customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers: Customer[];
  selectedCustomer: Customer;

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.getCustomers();
  }

  onSelect(customer: Customer): void {
    this.selectedCustomer = customer;
  }

  getCustomers(): void {
    this.customerService.getCustomers().then(customers => this.customers = customers);
  }
}
