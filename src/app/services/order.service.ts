import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IOrderData } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  public createOrder(orderCreationRequest: IOrderData): Observable<boolean> {
    return this.http.post<boolean>('http://localhost:3000/orders', orderCreationRequest);
  }

  public getAllOrders(userId: string): Observable<IOrderData[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('userId', userId);
    return this.http.get<IOrderData[]>('http://localhost:3000/orders',{
      params: queryParams
    });
  }
}
