import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IFoodData } from '../models/food.model';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  constructor(private http: HttpClient) {}

  public getFoodList(): Observable<IFoodData[]> {
    return this.http.get<IFoodData[]>('http://localhost:3000/foodList');
  }

}
