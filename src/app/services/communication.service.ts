import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private cartSizeSubject: BehaviorSubject<number>;
  public currentCartSize: Observable<number>

  constructor() { 
    this.cartSizeSubject = new BehaviorSubject<number>(0)
    this.currentCartSize = this.cartSizeSubject.asObservable()
  }

  public get currentCartSizeValue(): number {
    return this.cartSizeSubject.value;
  }

  public setCartSize(val: number){
    this.cartSizeSubject.next(val)
  }
}
