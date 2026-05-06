import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly count$ = new BehaviorSubject<number>(0);

  public get itemCount$(): Observable<number> {
    return this.count$.asObservable();
  }

  public addItem(quantity: number = 1): void {
    this.count$.next(this.count$.getValue() + quantity);
  }
}
