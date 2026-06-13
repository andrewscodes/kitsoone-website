import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { CartService, CartItem } from '../../service';
import { WHATSAPP_PHONE_NUMBER } from '../../constants';

@Component({
  selector: 'kitsoone-cart',
  standalone: true,
  imports: [DrawerModule, CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  public readonly cartItems$ = this.cartService.cartItems$;
  public readonly subtotal$ = this.cartService.subtotal$;
  public visible = false;

  public get checkoutWhatsAppUrl(): string {
    const items = this.cartService.currentItems;
    let message = 'Hola! Me gustaría ordenar lo siguiente:\n\n';
    for (const item of items) {
      message += `• ${item.name}`;
      if (item.selectedOptions?.length) {
        const opts = item.selectedOptions
          .map((o) => `${o.name}: ${o.value}`)
          .join(', ');
        message += ` (${opts})`;
      }
      message += ` x${item.quantity}\n`;
    }
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encoded}`;
  }

  public open(): void {
    this.visible = true;
    this.cdr.markForCheck();
  }

  public close(): void {
    this.visible = false;
    this.cdr.markForCheck();
  }

  protected increment(item: CartItem): void {
    this.cartService.updateQuantity(
      item.productId,
      item.variantId,
      item.quantity + 1,
    );
  }

  protected decrement(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(
        item.productId,
        item.variantId,
        item.quantity - 1,
      );
    }
  }

  protected remove(item: CartItem): void {
    this.cartService.removeItem(item.productId, item.variantId);
  }

  protected goToProducts(): void {
    this.close();
    this.router.navigate(['/productos']);
  }

  protected onCheckout(): void {
    this.cartService.clearCart();
    this.close();
  }
}
