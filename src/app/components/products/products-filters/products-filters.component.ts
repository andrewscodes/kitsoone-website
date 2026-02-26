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

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-products-filters',
  standalone: true,
  imports: [FormsModule, AccordionModule, CheckboxModule],
  templateUrl: './products-filters.component.html',
  styleUrls: ['./products-filters.component.scss'],
})
export class ProductsFiltersComponent {
  @Input() public categories: { label: string; value: string }[] = [];
  @Input() public selectedCategories: any[] = [];
  @Input() public idPrefix = '';

  @Output() public selectedCategoriesChange = new EventEmitter<any[]>();
}
