import { Injectable } from '@angular/core';
import { Customer } from '../model/customer';
import { CustomerService } from './customer.service';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

@Injectable()
export class CustomerServiceMock implements CustomerService {
  private nextId = 4;
  private repo: Customer[] = [ {
        id: 1,
        firstName: 'Vincent',
        lastName: 'Girard-Reydet',
        phone: '06.13.283.283',
        email: 'vincent.girardreydet@gmail.com'
    },
    {
        id: 2,
        firstName: 'Thibault',
        lastName: 'Girard-Reydet',
        phone: '06.13.283.283',
        email: 'vincent.girardreydet@gmail.com'
    },
    {
        id: 3,
        firstName: 'Sara',
        lastName: 'Doukkali',
        phone: '06.09.40.61.44',
        email: 'vincent.girardreydet@'
    }];

  getCustomers(): Observable<Customer[]> {
    return of(this.repo);
  }

  getCustomer(id: number): Observable<Customer> {
    for (const customer of this.repo) {
        if (customer.id === id) {
            return of(customer);
        }
    }
    return of();
  }

  createCustomer(customer: Customer): Observable<Customer> {
    const created = {
        id: this.nextId++,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email
    };
    this.repo.push(created);
    return of(created);
  }

  /**
   * Look for customers matching the provided term
   */
  searchCustomers(term: string): Observable<Customer[]> {
    if (!term.trim()) {
        // if not search term, return empty customer array.
        return of([]);
      }
    const result = [];
    for (const customer of this.repo) {
        if (customer.firstName.indexOf(term) !== -1 ||
            customer.lastName.indexOf(term) !== -1 ||
            customer.email.indexOf(term) !== -1) {
                result.push(customer);
            }
    }
    return of(result);
  }
}
