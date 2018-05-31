import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Customer } from '../model/customer';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'osc-customer-delete',
  templateUrl: './customer-delete.component.html'
})
export class CustomerDeleteComponent implements OnInit {
    @Input()
    public customer: Customer;
    saving = false;

    constructor(public activeModal: NgbActiveModal,
                public customerService: CustomerService) {
    }

    ngOnInit() { }

    onConfirm() {
        this.saving = true;
        this.customerService.deleteCustomer(this.customer)
            .pipe(timeout(5000))
            .subscribe(res => {
                this.customer = null;
                this.activeModal.close(null);
            }, err => {
                console.log('An error occured while deleting the customer: ' + err);
                this.saving = false;
            });
    }

    onDismiss() {
        this.customer = null;
        this.activeModal.dismiss('');
    }
}
