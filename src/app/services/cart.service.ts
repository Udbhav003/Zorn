import { HttpClient, HttpParams } from '@angular/common/http';
import { isNgTemplate } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ICartData } from '../models/cart.model';
import { IFoodData } from '../models/food.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  constructor(private http: HttpClient) {}

  public getCartItems(userId: string): Observable<ICartData[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('userId', userId);
    return this.http.get<ICartData[]>('http://localhost:3000/cart', {
      params: queryParams,
    });
  }

  public deleteCartItem(id: string, foods: IFoodData[]): Observable<boolean> {
    return this.http.patch<boolean>('http://localhost:3000/cart/' + id, {
      items: foods,
    });
  }

  public deleteCartItems(id: string): Observable<boolean> {
    return this.http.patch<boolean>('http://localhost:3000/cart/' + id, {
      items: [],
    });
  }

  public createCart(cart: ICartData): Observable<boolean> {
    return this.http.post<boolean>('http://localhost:3000/cart', cart).pipe(
      map((response) => {
        return response;
      })
    );
  }

  public addItemToCart(id: string, foods: IFoodData[]): Observable<boolean> {
    return this.http
      .patch<boolean>('http://localhost:3000/cart/' + id, { items: foods })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
