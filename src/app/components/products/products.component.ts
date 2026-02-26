import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KitsooneApiService, ProductResponse } from '../../service';
import { RouterModule } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { DrawerModule } from 'primeng/drawer';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProductsFiltersComponent } from './products-filters/products-filters.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DataViewModule,
    DrawerModule,
    SelectButtonModule,
    ProductsFiltersComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsComponent {
  private readonly apiService = inject(KitsooneApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected allProducts: ProductResponse[] = [];
  protected filteredProducts: ProductResponse[] = this.allProducts;
  protected categories = [
    { label: 'Teclados', value: 'keyboards' },
    { label: 'Accesorios', value: 'accessories' },
  ];

  protected selectedCategories: string[] = [];

  protected isFiltersOpen = false;
  protected layout: 'list' | 'grid' = 'grid';
  protected layoutOptions = [
    { icon: 'pi pi-bars', value: 'list' },
    { icon: 'pi pi-table', value: 'grid' },
  ];
  protected isLoadingProducts = false;
  protected productsError: string | null = null;

  constructor() {
    afterNextRender(() => {
      this.loadProducts();
    });
  }

  private async loadProducts(): Promise<void> {
    this.isLoadingProducts = true;
    this.productsError = null;
    this.cdr.markForCheck();

    this.apiService.getProducts().subscribe({
      next: async (products) => {
        this.allProducts = products;
        this.isLoadingProducts = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.productsError = error.message || 'Failed to load products';
        this.isLoadingProducts = false;
        this.cdr.markForCheck();
      },
    });
  }

  protected onFilterChange(): void {
    this.cdr.markForCheck();
  }
}
