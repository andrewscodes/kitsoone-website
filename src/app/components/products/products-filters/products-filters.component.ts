import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import {
  AvailableFiltersResponse,
  ProductResponse,
} from '../../../service/models/api.models';

export interface ProductFilters {
  categories: string[];
  connectivity: string[];
  colors: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  Keyboard: 'Teclados',
  Part: 'Accesorios',
};

const COLOR_LABELS: Record<string, string> = {
  Black: 'Negro',
  White: 'Blanco',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-products-filters',
  standalone: true,
  imports: [FormsModule, AccordionModule, CheckboxModule],
  templateUrl: './products-filters.component.html',
  styleUrls: ['./products-filters.component.scss'],
})
export class ProductsFiltersComponent implements OnChanges {
  @Input() public idPrefix = '';
  @Input() public availableFilters: AvailableFiltersResponse | null = null;
  @Input() public allProducts: ProductResponse[] = [];
  @Output() public filtersChange = new EventEmitter<ProductFilters>();

  protected categories: { label: string; value: string }[] = [];
  protected connectivity: { label: string; value: string }[] = [];
  protected colors: { label: string; value: string }[] = [];

  protected selectedCategories: string[] = [];
  protected selectedConnectivity: string[] = [];
  protected selectedColors: string[] = [];
  protected openPanels = ['0', '1', '2'];

  protected categoryCounts: Record<string, number> = {};
  protected connectivityCounts: Record<string, number> = {};
  protected colorCounts: Record<string, number> = {};

  ngOnChanges(): void {
    if (this.availableFilters) {
      this.categories = this.availableFilters.categories.map((v) => ({
        label: CATEGORY_LABELS[v] ?? v,
        value: v,
      }));
      this.connectivity = this.availableFilters.connectivity.map((v) => ({
        label: v,
        value: v,
      }));
      this.colors = this.availableFilters.colors.map((v) => ({
        label: COLOR_LABELS[v] ?? v,
        value: v,
      }));
    }
    this.computeCounts();
  }

  protected emitChange(): void {
    this.computeCounts();
    this.filtersChange.emit({
      categories: this.selectedCategories,
      connectivity: this.selectedConnectivity,
      colors: this.selectedColors,
    });
  }

  private computeCounts(): void {
    // Category counts: apply connectivity + color filters, then count per category value
    const forCategories = this.applyFilters(
      [],
      this.selectedConnectivity,
      this.selectedColors,
    );
    this.categoryCounts = {};
    for (const cat of this.categories) {
      this.categoryCounts[cat.value] = forCategories.filter(
        (p) =>
          p.attributes.find((a) => a.key === 'Category')?.value === cat.value,
      ).length;
    }

    // Connectivity counts: apply category + color filters, then count per connectivity value
    const forConnectivity = this.applyFilters(
      this.selectedCategories,
      [],
      this.selectedColors,
    );
    this.connectivityCounts = {};
    for (const conn of this.connectivity) {
      this.connectivityCounts[conn.value] = forConnectivity.filter(
        (p) =>
          p.attributes.find((a) => a.key === 'Connectivity')?.value ===
          conn.value,
      ).length;
    }

    // Color counts: apply category + connectivity filters, then count per color value
    const forColors = this.applyFilters(
      this.selectedCategories,
      this.selectedConnectivity,
      [],
    );
    this.colorCounts = {};
    for (const color of this.colors) {
      this.colorCounts[color.value] = forColors.filter((p) =>
        p.attributes
          .filter((a) => a.key === 'Color')
          .some((a) => a.value === color.value),
      ).length;
    }
  }

  private applyFilters(
    categories: string[],
    connectivity: string[],
    colors: string[],
  ): ProductResponse[] {
    return this.allProducts.filter((product) => {
      const attrs = product.attributes;

      if (categories.length > 0) {
        const val = attrs.find((a) => a.key === 'Category')?.value;
        if (!val || !categories.includes(val)) return false;
      }

      if (connectivity.length > 0) {
        const val = attrs.find((a) => a.key === 'Connectivity')?.value;
        if (!val || !connectivity.includes(val)) return false;
      }

      if (colors.length > 0) {
        const productColors = attrs
          .filter((a) => a.key === 'Color')
          .map((a) => a.value);
        if (!productColors.some((c) => colors.includes(c))) return false;
      }

      return true;
    });
  }
}
