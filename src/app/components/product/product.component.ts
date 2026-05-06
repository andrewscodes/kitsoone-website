import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import {
  KitsooneApiService,
  ProductResponse,
  CartService,
} from '../../service';
import {
  ProductOptionResponse,
  ProductVariantResponse,
} from '../../service/models/api.models';
import { slugify } from '../../constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SkeletonModule,
    BreadcrumbModule,
    InputNumberModule,
    FormsModule,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(KitsooneApiService);
  private readonly cartService = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly breadcrumbHome: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/',
  };

  protected readonly breadcrumbClass: string = 'Inicio';
  protected product: ProductResponse | null = null;
  protected isLoading = true;
  protected error: string | null = null;
  protected breadcrumbItems: MenuItem[] = [];

  protected selectedOptions: Record<string, string> = {};
  protected quantity = 1;

  protected get minPrice(): number {
    if (!this.product) return 0;
    if (!this.product.hasVariants || !this.product.variants.length) {
      return this.product.price;
    }
    return Math.min(...this.product.variants.map((v) => v.price));
  }

  protected get maxPrice(): number {
    if (!this.product) return 0;
    if (!this.product.hasVariants || !this.product.variants.length) {
      return this.product.price;
    }
    return Math.max(...this.product.variants.map((v) => v.price));
  }

  protected get hasPriceRange(): boolean {
    return this.minPrice !== this.maxPrice;
  }

  protected get selectedVariant(): ProductVariantResponse | null {
    if (!this.product?.hasVariants || !this.product.variants.length)
      return null;
    const selectedKeys = Object.keys(this.selectedOptions);
    if (selectedKeys.length === 0) return null;
    return (
      this.product.variants.find((v) =>
        v.selectedOptions.every(
          (so) => this.selectedOptions[so.optionName] === so.value,
        ),
      ) ?? null
    );
  }

  protected get totalPrice(): number {
    if (this.selectedVariant) return this.selectedVariant.price;
    return this.product?.price ?? 0;
  }

  protected get allOptionsSelected(): boolean {
    if (!this.product?.options.length) return true;
    return this.product.options.every((o) => !!this.selectedOptions[o.name]);
  }

  constructor() {
    afterNextRender(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) this.loadProduct(id);
    });
  }

  protected sortedOptions(): ProductOptionResponse[] {
    return [...(this.product?.options ?? [])].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
  }

  protected selectOption(optionName: string, value: string): void {
    this.selectedOptions = { ...this.selectedOptions, [optionName]: value };
    this.cdr.markForCheck();
  }

  protected addToCart(): void {
    if (!this.product || !this.allOptionsSelected) return;

    this.cartService.addItem(this.quantity);
  }

  private loadProduct(slug: string): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.apiService.getProducts().subscribe({
      next: (response) => {
        const found = response.products.find((p) => slugify(p.name) === slug);
        if (found) {
          this.product = found;
          this.breadcrumbItems = [
            { label: 'Productos', routerLink: '/productos' },
            { label: found.name },
          ];
          this.preSelectFirstOptions();
        } else {
          this.error = 'Producto no encontrado.';
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar el producto.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private preSelectFirstOptions(): void {
    if (!this.product?.options.length) return;
    const initial: Record<string, string> = {};
    for (const option of this.product.options) {
      if (option.values.length > 0) {
        const first = [...option.values].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        )[0];
        initial[option.name] = first.value;
      }
    }
    this.selectedOptions = initial;
  }
}
