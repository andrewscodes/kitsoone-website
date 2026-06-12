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
    const parsedQuantity = Number(quantity);
    const safeQuantity = Number.isFinite(parsedQuantity)
      ? Math.max(1, Math.floor(parsedQuantity))
      : 1;
    this.count$.next(this.count$.getValue() + safeQuantity);
  }
}
