import {Injectable} from '@angular/core';
import {Customer} from '../model/customer';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators';
import { buildSearchUrl } from './service-utils';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export class SearchResult {
  totalCount: number;
  customers: Customer[];
}

export abstract class CustomerService {
  abstract updateCustomer(customer: Customer): Observable<Customer>;
  abstract getCustomers(page?: number, pageSize?: number): Observable<SearchResult>;
  abstract getCustomer(id: number): Observable<Customer>;
  abstract searchCustomers(term: string, page?: number, pageSize?: number): Observable<SearchResult>;
  abstract createCustomer(customer: Customer): Observable<Customer>;
  abstract deleteCustomer(customer: Customer): Observable<Object>;
}

@Injectable()
export class HttpCustomerService implements CustomerService {
  private url = '/api/customers/';

  constructor(private http: HttpClient) {}

  getCustomers(page?: number, pageSize?: number): Observable<SearchResult> {
    const url = buildSearchUrl(this.url, null, page, pageSize);
    return this.http.get<SearchResult>(this.url).pipe(
        catchError(this.handleError<SearchResult>('getCustomers', null))
    );
  }

  getCustomer(id: number): Observable<Customer> {
    const url = `${this.url}${id}`;
    return this.http.get<Customer>(url).pipe(
        catchError(this.handleError<Customer>(`getCustomer id=${id}`))
    );
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.url, JSON.stringify(customer), httpOptions);
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(this.url + customer.id, JSON.stringify(customer), httpOptions);
  }

  /**
   * Look for customers matching the provided term
   */
  searchCustomers(term: string, page?: number, pageSize?: number): Observable<SearchResult> {
    const url = buildSearchUrl(this.url, term, page, pageSize);
    return this.http.get<SearchResult>(url).pipe(
      catchError(this.handleError<SearchResult>('searchCustomers', null))
    );
  }

  deleteCustomer(customer: Customer): Observable<Object> {
    return this.http.delete(this.url + customer.id);
  }

  private handleError<T>(operation = 'operation', result ?: T) {
    return (error: any): Observable<T> => {
        console.error(`${operation} failed`, error);
        return of(result as T);
    };
  }
}
