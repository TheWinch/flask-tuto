import { Injectable } from '@angular/core';
import { Customer } from './model/customer';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class CustomerService {
  private url="http://127.0.0.1:5000/api/customers";

  constructor(private http: Http) {}

  getCustomers(): Promise<Customer[]> {
    return this.http.get(this.url)
              .toPromise()
              .then(response => response.json() as Customer)
              .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
