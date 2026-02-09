import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { Carousel, CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { CommonModule } from '@angular/common';
import { AutoFocusModule } from 'primeng/autofocus';
import { DISCORD_URL } from '../../constants';
import {
  KitsooneApiService,
  ProductResponse,
  ShowcaseItem,
} from '../../service';

interface CarouselResponsiveOption {
  breakpoint: string;
  numVisible: number;
  numScroll: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-home',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    TagModule,
    ImageModule,
    AutoFocusModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit {
  private readonly apiService = inject(KitsooneApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly discordUrl = DISCORD_URL;
  protected products: ProductResponse[] = [];
  protected showcase!: ShowcaseItem[];
  protected showNavigators = false;
  protected isLoadingProducts = false;
  protected productsError: string | null = null;

  protected carouselResponsiveOptions: CarouselResponsiveOption[] = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 3,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 2,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  protected get shouldShowNavigators(): boolean {
    return this.getCurrentNumVisible() < 4;
  }

  public ngOnInit(): void {
    Carousel.prototype.onTouchMove = (): void => undefined;

    this.loadProducts();

    // Keep showcase as static data for now
    this.showcase = [
      {
        id: '1',
        image: 'assets/images/showcase1.jpg',
      },
      {
        id: '2',
        image: 'assets/images/showcase2.jpg',
      },
      {
        id: '3',
        image: 'assets/images/showcase3.jpg',
      },
      {
        id: '4',
        image: 'assets/images/showcase4.jpg',
      },
    ];
  }

  private loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = null;

    this.apiService.getProducts().subscribe({
      next: (products) => {
        // Validate and ensure all products have required fields
        this.products = products;
        this.isLoadingProducts = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.productsError = error.message || 'Failed to load products';
        this.isLoadingProducts = false;

        // Fallback to demo data if API fails
        this.products = [];
        this.cdr.markForCheck();
      },
    });
  }

  protected getCurrentNumVisible(): number {
    // Check if we're running in the browser (not SSR)
    if (typeof window === 'undefined') {
      return 4; // Default for SSR - assume desktop view
    }
    const screenWidth = window.innerWidth;
    // Find the matching responsive option based on current screen width
    for (const option of this.carouselResponsiveOptions) {
      const breakpointValue = parseInt(option.breakpoint.replace('px', ''));
      if (screenWidth < breakpointValue) {
        return option.numVisible;
      }
    }
    return 4; // Default for screens larger than the largest breakpoint
  }
}
