import { Injectable } from '@angular/core';
import { Customer } from '../model/customer';
import { CustomerService, SearchResult } from './customer.service';

import { Observable, of } from 'rxjs';

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

  getCustomers(page?: number, pageSize?: number): Observable<SearchResult> {
    return of({totalCount: this.repo.length, customers: this.repo});
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

  updateCustomer(customer: Customer): Observable<Customer> {
      return of(customer);
  }

  /**
   * Look for customers matching the provided term
   */
  searchCustomers(term: string, page?: number, pageSize?: number): Observable<SearchResult> {
    if (!term.trim()) {
        // if not search term, return empty customer array.
        return of({totalCount: 0, customers: []});
      }
    const result = [];
    for (const customer of this.repo) {
        if (customer.firstName.indexOf(term) !== -1 ||
            customer.lastName.indexOf(term) !== -1 ||
            customer.email.indexOf(term) !== -1) {
                result.push(customer);
            }
    }
    return of({totalCount: result.length, customers: result});
  }

  deleteCustomer(customer: Customer): Observable<Object> {
      this.repo = this.repo.filter(aCustomer => aCustomer.id !== customer.id);
      return of(null);
  }
}
