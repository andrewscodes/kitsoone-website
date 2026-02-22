import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
} from '@angular/core';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AutoFocusModule } from 'primeng/autofocus';
import { DISCORD_URL } from '../../constants';
import {
  KitsooneApiService,
  ProductResponse,
  ShowcaseItem,
} from '../../service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-home',
  standalone: true,
  imports: [CommonModule, TagModule, ImageModule, AutoFocusModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {
  @ViewChild('productsSwiper', { static: false })
  public productsSwiperRef?: ElementRef;
  @ViewChild('showcaseSwiper', { static: false })
  public showcaseSwiperRef?: ElementRef;
  private readonly platform = inject(PLATFORM_ID);
  private readonly apiService = inject(KitsooneApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly discordUrl = DISCORD_URL;
  protected products: ProductResponse[] = [];
  protected showcase!: ShowcaseItem[];
  protected isLoadingProducts = false;
  protected productsError: string | null = null;

  constructor() {
    if (isPlatformBrowser(this.platform)) {
      this.loadProducts();
      requestAnimationFrame(() => {
        this.initializeShowcaseSwiper();
      });
    }

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

  private initializeProductsSwiper(): void {
    try {
      if (!this.productsSwiperRef?.nativeElement) {
        return;
      }

      const params = {
        slidesPerView: 2,
        spaceBetween: 20,
        pagination: {
          clickable: true,
          el: '.swiper-products',
          renderBullet: function (_index: number, className: string) {
            return `<span class="${className}"></span>`;
          },
        },
        lazy: false,
        breakpoints: {
          760: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
        },
      };

      Object.assign(this.productsSwiperRef.nativeElement, params);
      this.productsSwiperRef.nativeElement.initialize();
    } catch (error) {
      console.warn('Failed to initialize swiper:', error);
    }
  }

  private initializeShowcaseSwiper(): void {
    try {
      if (!this.showcaseSwiperRef?.nativeElement) {
        return;
      }

      const params = {
        slidesPerView: 'auto',
        spaceBetween: 15,
        pagination: {
          clickable: true,
          el: '.swiper-showcase',
          renderBullet: function (_index: number, className: string) {
            return `<span class="${className}"></span>`;
          },
        },
        lazy: false,
      };

      Object.assign(this.showcaseSwiperRef.nativeElement, params);
      this.showcaseSwiperRef.nativeElement.initialize();
    } catch (error) {
      console.warn('Failed to initialize swiper:', error);
    }
  }

  private async loadProducts(): Promise<void> {
    this.isLoadingProducts = true;
    this.productsError = null;

    this.apiService.getProducts().subscribe({
      next: async (products) => {
        this.products = products;
        this.isLoadingProducts = false;
        this.cdr.markForCheck();

        requestAnimationFrame(() => {
          this.initializeProductsSwiper();
        });
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
