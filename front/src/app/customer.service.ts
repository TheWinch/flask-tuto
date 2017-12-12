import { Injectable } from '@angular/core';
import { Customer } from './model/customer';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';


@Injectable()
export class CustomerService {
  private url="http://127.0.0.1:5000/api/customers";

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

    /* GET customers whose name contains search term */
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
