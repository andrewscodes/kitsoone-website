import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KitsooneApiService, ProductResponse } from '../../service';
import { RouterModule } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AccordionModule,
    CheckboxModule,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsComponent implements OnInit {
  private readonly apiService = inject(KitsooneApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected allProducts: ProductResponse[] = [];
  protected filteredProducts: ProductResponse[] = [];
  protected categories = [
    { label: 'Teclados', value: 'keyboards' },
    { label: 'Accesorios', value: 'accessories' },
  ];

  protected selectedCategories: any[] = [];

  protected isLoadingProducts = false;
  protected productsError: string | null = null;

  protected selectedFilter = 'all';

  public ngOnInit(): void {
    this.loadProducts();
    this.selectedCategories = [];
  }

  private loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = null;

    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.filteredProducts = products;
        this.isLoadingProducts = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.productsError = error.message || 'Failed to load products';
        this.isLoadingProducts = false;
        this.allProducts = [];
        this.filteredProducts = [];
        this.cdr.markForCheck();
      },
    });
  }

  protected onFilterChange(): void {
    if (this.selectedFilter === 'all') {
      this.filteredProducts = this.allProducts;
    } else {
      this.filteredProducts = this.allProducts.filter((product) =>
        this.selectedFilter === 'keyboards'
          ? this.isKeyboard(product)
          : this.isAccessory(product),
      );
    }
    this.cdr.markForCheck();
  }

  private isKeyboard(product: ProductResponse): boolean {
    const keyboardKeywords = ['keyboard', 'teclado'];
    const productName = product.name.toLowerCase();
    return keyboardKeywords.some((keyword) => productName.includes(keyword));
  }

  private isAccessory(product: ProductResponse): boolean {
    return !this.isKeyboard(product);
  }
}
