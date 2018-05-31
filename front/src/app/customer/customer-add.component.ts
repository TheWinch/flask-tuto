import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Customer } from '../model/customer';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'osc-customer-add',
  templateUrl: './customer-add.component.html'
})
export class CustomerAddComponent implements OnInit {
    newCustomer: Customer;
    saving = false;

    constructor(public activeModal: NgbActiveModal,
                public customerService: CustomerService,
                public router: Router) {
    }

    ngOnInit() {
        this.createEmptyCustomer();
    }

    onConfirm() {
        this.saving = true;
        this.customerService.createCustomer(this.newCustomer)
            .pipe(timeout(5000))
            .subscribe(res => {
                this.saving = false;
                this.closeModal(res);
                this.router.navigate(['customers', res.id]);
            }, err => {
                console.log('An error occured while creating the customer: ' + err);
                this.saving = false;
            });
    }

    onDismiss() {
        this.closeModal(null);
    }

    private closeModal(customer: Customer): void {
        if (customer == null) {
            this.activeModal.dismiss('');
        } else {
            this.activeModal.close(customer);
        }
        this.createEmptyCustomer();
    }

    private createEmptyCustomer() {
        this.newCustomer = {
            firstName: '',
            lastName: '',
            phone: '',
            email: ''
          };
    }
}
