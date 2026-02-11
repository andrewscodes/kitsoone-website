import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  PLATFORM_ID,
} from '@angular/core';
import { Carousel, CarouselModule } from 'primeng/carousel';
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
  @ViewChild('productsSwiper', { static: false }) public swiperRef?: ElementRef;
  private readonly apiService = inject(KitsooneApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly discordUrl = DISCORD_URL;
  protected products: ProductResponse[] = [];
  protected showcase!: ShowcaseItem[];
  protected showNavigators = false;
  protected isLoadingProducts = false;
  protected productsError: string | null = null;

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

  private async initializeSwiper(): Promise<void> {
    try {
      await customElements.whenDefined('swiper-container');

      if (!this.swiperRef?.nativeElement) {
        return;
      }

      const params = {
        slidesPerView: 1,
        spaceBetween: 15,
        pagination: {
          clickable: true,
          el: '.swiper-pagination',
          renderBullet: function (_index: number, className: any) {
            return `<span class="${className}"></span>`;
          },
        },
        lazy: false,
        breakpoints: {
          760: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 15,
          },
        },
      };

      Object.assign(this.swiperRef.nativeElement, params);
      this.swiperRef.nativeElement.initialize();
    } catch (error) {
      console.warn('Failed to initialize swiper:', error);
    }
  }

  private loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = null;

    this.apiService.getProducts().subscribe({
      next: async (products) => {
        this.products = products;
        this.isLoadingProducts = false;
        this.cdr.markForCheck();

        // Initialize swiper after a short delay to ensure DOM is ready
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.initializeSwiper(), 300);
        }
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
}
