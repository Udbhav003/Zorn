import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { IUserFormData } from '../models/user.model';

interface LocalStorageData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserIdSubject: BehaviorSubject<LocalStorageData>;
  public currentUser: Observable<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;

  constructor(private http: HttpClient) {
    this.currentUserIdSubject = new BehaviorSubject<LocalStorageData>(
      JSON.parse(localStorage.getItem('currentUser')!)
    );
    this.currentUser = this.currentUserIdSubject.asObservable();
  }

  public get currentUserValue(): LocalStorageData {
    return this.currentUserIdSubject.value;
  }

  public login(formData: any): Observable<IUserFormData> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('email', formData.email);
    queryParams = queryParams.append('password', formData.password);
    return this.http
      .get<IUserFormData[]>('http://localhost:3000/users', {
        params: queryParams,
      })
      .pipe(
        map((users) => {
          if (users.length > 0) {
            let localStorageData = {
              id: users[0].id,
              firstName: users[0].firstName,
              lastName: users[0].lastName,
              email: users[0].email,
            };
            localStorage.setItem(
              'currentUser',
              JSON.stringify(localStorageData)
            );
            this.currentUserIdSubject.next(localStorageData);
          }
          return users[0];
        })
      );
  }

  public register(formData: any): Observable<IUserFormData[]> {
    return this.http.post<IUserFormData[]>(
      'http://localhost:3000/users',
      formData
    );
  }

  public isUserRegistered(formData: any): Observable<IUserFormData[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('email', formData.email);
    return this.http.get<IUserFormData[]>('http://localhost:3000/users', {
      params: queryParams,
    });
  }

  public logout() {
    localStorage.removeItem('currentUser');
    this.currentUserIdSubject.next(null!);
  }
}
