import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';

@Component({
  selector: 'kitsoone-search',
  standalone: true,
  imports: [
    DrawerModule,
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  public visibleSearch = false;
  public searchQuery = '';
  public isSearching = false;

  public toggleSearch(): void {
    this.visibleSearch = !this.visibleSearch;
    this.cdr.markForCheck();
  }

  public openSearch(): void {
    this.visibleSearch = true;
    this.cdr.markForCheck();
    // Focus on the input after drawer opens
    setTimeout(() => {
      const input = document.querySelector(
        '.search-drawer__input',
      ) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 300);
  }

  public closeSearch(): void {
    this.visibleSearch = false;
    this.searchQuery = '';
    this.cdr.markForCheck();
  }

  protected onSearch(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.closeSearch();
      this.router.navigate(['/productos'], { queryParams: { q: query } });
    }
  }
}
