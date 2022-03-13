import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { IAddressData } from '../models/address.model';
import { IPaymentMethodData } from '../models/pay-method.model';
import { IUserFormData } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  public updateUser(id: string, user: IUserFormData): Observable<boolean> {
    return this.http.patch<boolean>('http://localhost:3000/users/' + id, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
    });
  }

  public updateAddress(
    id: string,
    address: IAddressData[]
  ): Observable<boolean> {
    return this.http.patch<boolean>('http://localhost:3000/users/' + id, {
      addresses: address,
    });
  }

  public deletePaymentMethod(id: string, methods: IPaymentMethodData[]): Observable<boolean> {
    return this.http.patch<boolean>('http://localhost:3000/users/' + id, {
      paymentMethods: methods,
    });
  }

  public updatePaymentMethods(
    id: string,
    paymentMethods: IPaymentMethodData[]
  ): Observable<boolean> {
    return this.http.patch<boolean>('http://localhost:3000/users/' + id, {
      paymentMethods: paymentMethods,
    });
  }

  public getUserData(id: string): Observable<IUserFormData> {
    return this.http.get<IUserFormData>('http://localhost:3000/users/' + id);
  }
}
