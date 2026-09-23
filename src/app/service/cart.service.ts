import { Injectable, PLATFORM_ID, effect, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { KitsooneApiService } from './kitsoone-api.service';
import { CartItemRequest, ProductResponse } from './models/api.models';
import { CART_STORAGE_KEY } from '../constants';

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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(KitsooneApiService);

  private readonly items$ = new BehaviorSubject<CartItem[]>([]);
  private readonly saveTrigger$ = new Subject<CartItem[]>();
  // Skips the logout-clear branch on the effect's initial run (no real transition yet).
  private isFirstAuthCheck = true;

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

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromLocalStorage();

      this.saveTrigger$
        .pipe(
          debounceTime(500),
          switchMap((items) =>
            this.apiService.saveCart(items.map(this.toDto)).pipe(
              catchError((error) => {
                console.error('Failed to save cart:', error);
                return of(null);
              }),
            ),
          ),
        )
        .subscribe();
    }

    effect(() => {
      const authenticated = this.authService.isAuthenticated();

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      if (authenticated) {
        this.syncOnLogin();
      } else if (!this.isFirstAuthCheck) {
        this.items$.next([]);
      }

      this.isFirstAuthCheck = false;
    });
  }

  public addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    const parsedQuantity = Number(quantity);
    const safeQuantity = Number.isFinite(parsedQuantity)
      ? Math.max(1, Math.floor(parsedQuantity))
      : 1;

    const current = this.items$.getValue();
    const existingIndex = current.findIndex(
      (existingItem) =>
        existingItem.productId === item.productId &&
        existingItem.variantId === item.variantId,
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

    this.persist();
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
    this.persist();
  }

  public removeItem(productId: string, variantId?: string): void {
    const current = this.items$.getValue();
    this.items$.next(
      current.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId),
      ),
    );
    this.persist();
  }

  public clearCart(): void {
    this.items$.next([]);
    this.persist();
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const items = this.items$.getValue();

    if (this.authService.isAuthenticated()) {
      this.saveTrigger$.next(items);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        this.items$.next(JSON.parse(raw) as CartItem[]);
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }

  private syncOnLogin(): void {
    const localItems = this.items$.getValue();

    this.apiService
      .mergeCart(localItems.map(this.toDto))
      .pipe(switchMap((merged) => this.hydrateItems(merged)))
      .subscribe({
        next: (hydrated) => {
          this.items$.next(hydrated);
          localStorage.removeItem(CART_STORAGE_KEY);
        },
        error: (error) => console.error('Failed to sync cart on login:', error),
      });
  }

  private hydrateItems(serverItems: CartItemRequest[]): Observable<CartItem[]> {
    if (serverItems.length === 0) {
      return of([]);
    }

    const uniqueProductIds = [
      ...new Set(serverItems.map((serverItem) => serverItem.productId)),
    ];

    return forkJoin(
      uniqueProductIds.map((productId) =>
        this.apiService
          .getProductById(productId)
          .pipe(catchError(() => of(null))),
      ),
    ).pipe(
      map((products) => {
        const productMap = new Map(
          products
            .filter((product): product is ProductResponse => product !== null)
            .map((product) => [product.id, product]),
        );

        return serverItems.reduce<CartItem[]>((hydratedItems, serverItem) => {
          const product = productMap.get(serverItem.productId);
          if (!product) {
            return hydratedItems;
          }

          const variant = serverItem.variantId
            ? product.variants.find(
                (candidate) => candidate.id === serverItem.variantId,
              )
            : undefined;

          hydratedItems.push({
            productId: product.id,
            variantId: serverItem.variantId,
            name: product.name,
            price: variant?.price ?? product.price,
            imageUrl: variant?.imageUrl ?? product.imageUrl,
            quantity: serverItem.quantity,
            selectedOptions: variant?.selectedOptions.map((option) => ({
              name: option.optionName,
              value: option.value,
            })),
          });

          return hydratedItems;
        }, []);
      }),
    );
  }

  private toDto(item: CartItem): CartItemRequest {
    return {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    };
  }
}
