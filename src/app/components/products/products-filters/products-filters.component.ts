import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';

export interface ProductFilters {
  categories: string[];
  connectivity: string[];
  colors: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-products-filters',
  standalone: true,
  imports: [FormsModule, AccordionModule, CheckboxModule],
  templateUrl: './products-filters.component.html',
  styleUrls: ['./products-filters.component.scss'],
})
export class ProductsFiltersComponent {
  @Input() public idPrefix = '';
  @Output() public filtersChange = new EventEmitter<ProductFilters>();

  protected categories = [
    { label: 'Teclados', value: 'keyboards' },
    { label: 'Accesorios', value: 'accessories' },
  ];

  protected connectivity = [{ label: 'Bluetooth', value: 'bluetooth' }];

  protected colors = [
    { label: 'Blanco', value: 'white' },
    { label: 'Negro', value: 'black' },
  ];

  protected selectedCategories: string[] = [];
  protected selectedConnectivity: string[] = [];
  protected selectedColors: string[] = [];
  protected openPanels = ['0', '1', '2'];

  protected emitChange(): void {
    this.filtersChange.emit({
      categories: this.selectedCategories,
      connectivity: this.selectedConnectivity,
      colors: this.selectedColors,
    });
  }
}
