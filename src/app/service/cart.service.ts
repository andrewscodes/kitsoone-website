import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  selectedOptions?: { name: string; value: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly items$ = new BehaviorSubject<CartItem[]>([]);

  public get cartItems$(): Observable<CartItem[]> {
    return this.items$.asObservable();
  }

  public get currentItems(): CartItem[] {
    return this.items$.getValue();
  }

  public get itemCount$(): Observable<number> {
    return this.items$.pipe(
      map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
    );
  }

  public get subtotal$(): Observable<number> {
    return this.items$.pipe(
      map((items) =>
        items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      ),
    );
  }

  public addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    const parsedQuantity = Number(quantity);
    const safeQuantity = Number.isFinite(parsedQuantity)
      ? Math.max(1, Math.floor(parsedQuantity))
      : 1;

    const current = this.items$.getValue();
    const existingIndex = current.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );

    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + safeQuantity,
      };
      this.items$.next(updated);
    } else {
      this.items$.next([...current, { ...item, quantity: safeQuantity }]);
    }
  }

  public updateQuantity(
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ): void {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const current = this.items$.getValue();
    const updated = current.map((item) =>
      item.productId === productId && item.variantId === variantId
        ? { ...item, quantity: safeQuantity }
        : item,
    );
    this.items$.next(updated);
  }

  public removeItem(productId: string, variantId?: string): void {
    const current = this.items$.getValue();
    this.items$.next(
      current.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId),
      ),
    );
  }

  public clearCart(): void {
    this.items$.next([]);
  }
}
