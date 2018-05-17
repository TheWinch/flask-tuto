import { Component, OnInit } from '@angular/core';
import { Customer } from '../model/customer';
import { CustomerService } from '../services/customer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { flatMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'osc-customer-edit',
  templateUrl: './customer-edit.component.html',
  styles: []
})
export class CustomerEditComponent implements OnInit {
  // New customer creation fields
  newCustomer: Customer = null;
  loading = true;

  constructor(private customerService: CustomerService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.pipe(flatMap(params => params.get('id') === 'new' ?
      of(new Customer()) :
      this.customerService.getCustomer(+params.get('id')))
    ).subscribe(customer => {
      this.newCustomer = customer;
      this.loading = false;
    });
  }

  onCancel() {
    this.router.navigate(['customers']);
  }

  onSave() {
    if (this.newCustomer.id == null) {
      this.customerService.createCustomer(this.newCustomer).subscribe(res => {
        this.router.navigate(['customers'], { queryParams: { title: this.newCustomer.firstName + ' ' + this.newCustomer.lastName } });
      }, err => {
        console.log('An error occured while creating the customer: ' + err);
      });
    } else {
      this.customerService.updateCustomer(this.newCustomer).subscribe(data => {
        this.router.navigate(['customers']);
      }, failure => {
        console.error('Could not update customer: ' + failure);
      });
    }
  }

}
