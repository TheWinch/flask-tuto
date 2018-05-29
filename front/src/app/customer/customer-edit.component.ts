import { Component, OnInit } from '@angular/core';
import { Customer } from '../model/customer';
import { CustomerService } from '../services/customer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchOrdersResult, AppointmentService } from '../services/appointment.service';
import { Order } from '../model/order';
import { Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

@Component({
  selector: 'osc-customer-edit',
  templateUrl: './customer-edit.component.html',
  styles: []
})
export class CustomerEditComponent implements OnInit {
  orders$: Observable<Order[]>;
  customer: Customer = null;
  loading = true;

  constructor(private customerService: CustomerService,
              private appointmentService: AppointmentService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.pipe(flatMap(params => this.customerService.getCustomer(+params.get('id')))
    ).subscribe(customer => {
      this.customer = customer;
      this.loading = false;
      this.getPage();
    });
  }

  onCancel() {
    this.router.navigate(['customers']);
  }

  onSave() {
    this.customerService.updateCustomer(this.customer).subscribe(data => {
      this.router.navigate(['customers']);
    }, failure => {
      console.error('Could not update customer: ' + failure);
    });
  }

  private getPage() {
    this.orders$ = this.appointmentService.getOrdersByCustomer(this.customer.id);
  }

  createOrder(): void {
    this.router.navigate(['orders', 'new'], { queryParams: { from: this.router.url } });
  }

  editOrder(order: Order): void {
    this.router.navigate(['orders', order.id], { queryParams: { from: this.router.url } });
  }

}
