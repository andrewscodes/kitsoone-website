import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { DrawerModule } from 'primeng/drawer';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductResponse } from '../../service';
import { AvailableFiltersResponse } from '../../service/models/api.models';
import {
  ProductsFiltersComponent,
  ProductFilters,
} from '../products/products-filters/products-filters.component';
import { SKELETON_ITEMS } from '../../constants/product.constants';
import { slugify } from '../../constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-product-list',
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
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductListComponent {
  @Input() public products: ProductResponse[] = [];
  @Input() public availableFilters: AvailableFiltersResponse | null = null;
  @Input() public isLoading = false;
  @Input() public error: string | null = null;
  @Output() public filtersChange = new EventEmitter<ProductFilters>();

  protected readonly slugify = slugify;
  protected readonly categoryLabels: Record<string, string> = {
    Keyboard: 'Teclado',
    Part: 'Accesorio',
  };
  protected readonly skeletonItems = SKELETON_ITEMS;

  protected isFiltersOpen = false;
  protected layout: 'list' | 'grid' = 'grid';
  protected layoutOptions = [
    { icon: 'pi pi-bars', value: 'list' },
    { icon: 'pi pi-table', value: 'grid' },
  ];

  protected onFiltersVisibleChange(value: boolean): void {
    this.isFiltersOpen = value;
  }

  protected getCategory(product: ProductResponse): string {
    const value =
      product.attributes.find((a) => a.key === 'Category')?.value ?? '';
    return this.categoryLabels[value] ?? value;
  }

  protected onFilterChange(filters: ProductFilters): void {
    this.filtersChange.emit(filters);
  }
}
