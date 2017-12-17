import { Injectable } from '@angular/core';
import { ProtoCustomer, Customer } from './model/customer';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export abstract class CustomerService {
  abstract getCustomers(): Observable<Customer[]>;
  abstract getCustomer(id: number): Observable<Customer>;
  abstract searchCustomers(term: string): Observable<Customer[]>;
  abstract createCustomer(customer: ProtoCustomer): Observable<Customer>;
}

@Injectable()
export class HttpCustomerService implements CustomerService {
  private url = '/api/customers';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.url).pipe(
                tap(customers => console.log(`Fetched customers: ${customers}`)),
                catchError(this.handleError('getCustomers', []))
            );
  }

  getCustomer(id: number): Observable<Customer> {
    const url = `${this.url}/${id}`;
    return this.http.get<Customer>(url).pipe(
      tap(_ => console.log(`fetched customer id=${id}`)),
      catchError(this.handleError<Customer>(`getCustomer id=${id}`))
    );
  }

  createCustomer(customer: ProtoCustomer): Observable<Customer> {
    return this.http.post<Customer>(this.url, customer);
  }

  /**
   * Look for customers matching the provided term
   */
  searchCustomers(term: string): Observable<Customer[]> {
    if (!term.trim()) {
      // if not search term, return empty customer array.
      return of([]);
    }
    return this.http.get<Customer[]>(`${this.url}/?name=${term}`).pipe(
      tap(_ => console.log(`found customers matching "${term}"`)),
      catchError(this.handleError<Customer[]>('searchCustomers', []))
    );
  }

  private handleError<T>(operation = 'operation', result ?: T) {
    return (error: any): Observable<T> => {
        console.error(`${operation} failed`, error);
        return of(result as T);
    }
  }
}
