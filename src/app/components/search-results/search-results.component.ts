import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KitsooneApiService, ProductResponse } from '../../service';
import { AvailableFiltersResponse } from '../../service/models/api.models';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProductListComponent } from '../product-list/product-list.component';
import { ProductFilters } from '../products/products-filters/products-filters.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-search-results',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ProductListComponent,
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnDestroy {
  private readonly apiService = inject(KitsooneApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  protected allProducts: ProductResponse[] = [];
  protected filteredProducts: ProductResponse[] = [];
  protected availableFilters: AvailableFiltersResponse | null = null;
  protected searchTerm = '';
  protected searchInput = '';

  protected isLoadingProducts = false;
  protected productsError: string | null = null;

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const q = params.get('q') ?? '';
        this.searchTerm = q;
        this.searchInput = q;
        this.loadProducts(undefined, q);
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onFilterChange(filters: ProductFilters): void {
    this.loadProducts(filters, this.searchTerm);
  }

  protected onNewSearch(): void {
    const query = this.searchInput.trim();
    if (query) {
      this.router.navigate(['/buscar'], { queryParams: { q: query } });
    }
  }

  private loadProducts(filters?: ProductFilters, searchTerm?: string): void {
    this.isLoadingProducts = true;
    this.productsError = null;
    this.cdr.markForCheck();

    this.apiService.searchProducts({ ...filters, searchTerm }).subscribe({
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
