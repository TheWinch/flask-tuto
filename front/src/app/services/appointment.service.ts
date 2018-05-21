import {Order} from '../model/order';
import {buildSearchUrl} from './service-utils';

import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

export class SearchOrdersResult {
  totalCount: number;
  orders: Order[];
}

export abstract class AppointmentService {
  abstract getOrder(id): Observable<Order>;

  abstract getOrders(page?: number, pageSize?: number): Observable<Order[]>;

  abstract searchOrders(page?: number, pageSize?: number, term?: string): Observable<SearchOrdersResult>;

  abstract createOrder(order: Order): Observable<Order>;

  abstract updateOrder(order: Order): Observable<Order>;
}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class HttpAppointmentService implements AppointmentService {
  private url = '/api/orders/';

  constructor(private http: HttpClient) {}

  getOrder(id): Observable<Order> {
    return this.http.get<Order>(this.url + id);
  }

  getOrders(page?: number, pageSize?: number): Observable<Order[]> {
    const url = buildSearchUrl(this.url, '', page, pageSize);
    return this.http.get<Order[]>(url).pipe(
      catchError(this.handleError('getOrders', []))
    );
  }

  searchOrders(page?: number, pageSize?: number, term?: string): Observable<SearchOrdersResult> {
    const url = buildSearchUrl(this.url, term, page, pageSize);
    return this.http.get<SearchOrdersResult>(url).pipe(
      catchError(this.handleError<SearchOrdersResult>('searchOrders', {totalCount: 0, orders: []}))
    );
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.url, JSON.stringify(order), httpOptions);
  }

  updateOrder(order: Order): Observable<Order> {
    return this.http.put<Order>(this.url + order.id, JSON.stringify(order), httpOptions);
  }

  private handleError<T>(operation = 'operation', result ?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed`, error);
      return of(result as T);
    };
  }
}
