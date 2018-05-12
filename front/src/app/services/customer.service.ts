import {Injectable} from '@angular/core';
import {Customer} from '../model/customer';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export abstract class CustomerService {
  abstract getCustomers(): Observable<Customer[]>;
  abstract getCustomer(id: number): Observable<Customer>;
  abstract searchCustomers(term: string): Observable<Customer[]>;
  abstract createCustomer(customer: Customer): Observable<Customer>;
}

@Injectable()
export class HttpCustomerService implements CustomerService {
  private url = '/api/customers/';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.url).pipe(
                catchError(this.handleError('getCustomers', []))
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

  /**
   * Look for customers matching the provided term
   */
  searchCustomers(term: string): Observable<Customer[]> {
    if (!term.trim()) {
      // if not search term, return empty customer array.
      console.error('I have seen an empty search term')
      return of([]);
    }
    return this.http.get<Customer[]>(`${this.url}?name=${term}`).pipe(
      catchError(this.handleError<Customer[]>('searchCustomers', []))
    );
  }

  private handleError<T>(operation = 'operation', result ?: T) {
    return (error: any): Observable<T> => {
        console.error(`${operation} failed`, error);
        return of(result as T);
    };
  }
}
