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
import { AvailableFiltersResponse } from '../../service/models/api.models';
import { RouterModule } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { DrawerModule } from 'primeng/drawer';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import {
  ProductsFiltersComponent,
  ProductFilters,
} from './products-filters/products-filters.component';
import { SKELETON_ITEMS } from '../../constants/product.constants';
import { slugify } from '../../constants';

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
    SkeletonModule,
    ProductsFiltersComponent,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsComponent {
  private readonly apiService = inject(KitsooneApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly categoryLabels: Record<string, string> = {
    Keyboard: 'Teclado',
    Part: 'Accesorio',
  };

  protected readonly slugify = slugify;
  protected allProducts: ProductResponse[] = [];
  protected filteredProducts: ProductResponse[] = [];
  protected availableFilters: AvailableFiltersResponse | null = null;

  protected isFiltersOpen = false;
  protected skeletonItems = SKELETON_ITEMS;
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

  protected onFiltersVisibleChange(value: boolean): void {
    this.isFiltersOpen = value;
    this.cdr.markForCheck();
  }

  protected getCategory(product: ProductResponse): string {
    const value =
      product.attributes.find((a) => a.key === 'Category')?.value ?? '';
    return this.categoryLabels[value] ?? value;
  }

  protected onFilterChange(filters: ProductFilters): void {
    this.loadProducts(filters);
  }

  private loadProducts(filters?: ProductFilters): void {
    this.isLoadingProducts = true;
    this.productsError = null;
    this.cdr.markForCheck();

    this.apiService.getProducts(filters).subscribe({
      next: (response) => {
        if (!filters) {
          this.allProducts = response.products;
          this.availableFilters = response.availableFilters;
        }
        this.filteredProducts = response.products;
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
}
