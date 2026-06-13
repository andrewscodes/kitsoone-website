import {
  Component,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  OnDestroy,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SkeletonModule } from 'primeng/skeleton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import {
  KitsooneApiService,
  ProductResponse,
  CartService,
} from '../../service';
import {
  ProductOptionResponse,
  ProductVariantResponse,
} from '../../service/models/api.models';
import { slugify } from '../../constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'kitsoone-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SkeletonModule,
    BreadcrumbModule,
    FormsModule,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductComponent implements OnDestroy {
  @ViewChild('gallerySwiper', { static: false })
  public gallerySwiperRef?: ElementRef;

  @ViewChild('thumbsSwiper', { static: false })
  public thumbsSwiperRef?: ElementRef;

  @ViewChild('relatedSwiper', { static: false })
  public relatedSwiperRef?: ElementRef;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(KitsooneApiService);
  private readonly cartService = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);

  private routeSub?: Subscription;
  private gallerySwiperInstance: Record<string, unknown> | null = null;
  private thumbsSwiperInstance: Record<string, unknown> | null = null;

  protected readonly breadcrumbHome: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/',
  };

  protected readonly breadcrumbClass: string = 'Inicio';
  protected readonly slugify = slugify;
  protected readonly relatedSkeletonSlides = Array.from({ length: 4 });
  protected product: ProductResponse | null = null;
  protected relatedProducts: ProductResponse[] = [];
  protected isLoading = true;
  protected error: string | null = null;
  protected breadcrumbItems: MenuItem[] = [];

  protected selectedOptions: Record<string, string> = {};
  protected quantity = 1;

  protected get detailsHtml(): SafeHtml {
    const html = this.product?.detailsHtml ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  protected get hasDetailsHtml(): boolean {
    const html = this.product?.detailsHtml ?? '';
    return html.trim().length > 0;
  }

  protected get galleryImages(): string[] {
    if (!this.product) return [];
    const urls: string[] = [];
    for (const url of [
      this.product.imageUrl,
      ...this.product.variants.map((v) => v.imageUrl),
    ]) {
      if (url && !urls.includes(url)) urls.push(url);
    }
    return urls;
  }

  protected get minPrice(): number {
    if (!this.product) return 0;
    if (!this.product.hasVariants || !this.product.variants.length) {
      return this.product.price;
    }
    return Math.min(...this.product.variants.map((v) => v.price));
  }

  protected get maxPrice(): number {
    if (!this.product) return 0;
    if (!this.product.hasVariants || !this.product.variants.length) {
      return this.product.price;
    }
    return Math.max(...this.product.variants.map((v) => v.price));
  }

  protected get hasPriceRange(): boolean {
    return this.minPrice !== this.maxPrice;
  }

  protected get selectedVariant(): ProductVariantResponse | null {
    if (!this.product?.hasVariants || !this.product.variants.length)
      return null;
    const selectedKeys = Object.keys(this.selectedOptions);
    if (selectedKeys.length === 0) return null;
    return (
      this.product.variants.find((v) =>
        v.selectedOptions.every(
          (so) => this.selectedOptions[so.optionName] === so.value,
        ),
      ) ?? null
    );
  }

  protected get totalPrice(): number {
    if (this.selectedVariant) return this.selectedVariant.price;
    return this.product?.price ?? 0;
  }

  protected get allOptionsSelected(): boolean {
    if (!this.product?.options.length) return true;
    return this.product.options.every((o) => !!this.selectedOptions[o.name]);
  }

  constructor() {
    afterNextRender(() => {
      this.routeSub = this.route.paramMap.subscribe((params) => {
        const slug = params.get('slug');
        if (slug) this.loadProduct(slug);
      });
    });
  }

  public ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  protected sortedOptions(): ProductOptionResponse[] {
    return [...(this.product?.options ?? [])].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
  }

  protected selectOption(optionName: string, value: string): void {
    this.selectedOptions = { ...this.selectedOptions, [optionName]: value };
    this.navigateToVariantImage();
    this.cdr.markForCheck();
  }

  private navigateToVariantImage(): void {
    if (!this.selectedVariant?.imageUrl) return;

    const gallerySwiper = this.getGallerySwiperInstance();
    const thumbsSwiper = this.getThumbsSwiperInstance();
    if (!gallerySwiper) return;

    const targetImageUrl = this.selectedVariant.imageUrl;
    const slideIndex = this.galleryImages.indexOf(targetImageUrl);
    if (slideIndex !== -1) {
      (gallerySwiper['slideTo'] as (index: number, speed: number) => void)(
        slideIndex,
        0,
      );
      if (thumbsSwiper) {
        (thumbsSwiper['slideTo'] as (index: number, speed: number) => void)(
          slideIndex,
          0,
        );
      }
    }
  }

  private getGallerySwiperInstance(): Record<string, unknown> | null {
    if (
      !this.gallerySwiperInstance &&
      this.gallerySwiperRef?.nativeElement?.swiper
    ) {
      this.gallerySwiperInstance = this.gallerySwiperRef.nativeElement.swiper;
    }
    return this.gallerySwiperInstance;
  }

  private getThumbsSwiperInstance(): Record<string, unknown> | null {
    if (
      !this.thumbsSwiperInstance &&
      this.thumbsSwiperRef?.nativeElement?.swiper
    ) {
      this.thumbsSwiperInstance = this.thumbsSwiperRef.nativeElement.swiper;
    }
    return this.thumbsSwiperInstance;
  }

  protected addToCart(): void {
    if (!this.product || !this.allOptionsSelected) return;
    this.clampQuantity();
    const variant = this.selectedVariant;
    this.cartService.addItem(
      {
        productId: this.product.id,
        variantId: variant?.id,
        name: this.product.name,
        price: variant?.price ?? this.product.price,
        imageUrl: variant?.imageUrl ?? this.product.imageUrl,
        selectedOptions: variant
          ? variant.selectedOptions.map((o) => ({ name: o.optionName, value: o.value }))
          : undefined,
      },
      this.quantity,
    );
    this.cdr.markForCheck();
  }

  protected increment(): void {
    this.quantity++;
    this.cdr.markForCheck();
  }

  protected decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.cdr.markForCheck();
    }
  }

  protected clampQuantity(): void {
    this.quantity = Math.max(1, Math.floor(this.quantity) || 1);
    this.cdr.markForCheck();
  }

  protected openRelatedProduct(product: ProductResponse, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/productos', slugify(product.name)]);
  }

  private loadProduct(slug: string): void {
    this.isLoading = true;
    this.error = null;
    this.product = null;
    this.relatedProducts = [];
    this.breadcrumbItems = [];
    this.selectedOptions = {};
    this.quantity = 1;
    this.gallerySwiperInstance = null;
    this.thumbsSwiperInstance = null;
    this.flushView();

    this.apiService.getProductBySlug(slug).subscribe({
      next: (product) => {
        const canonicalSlug = slugify(product.name);
        if (slug !== canonicalSlug) {
          this.router.navigate(['/productos', canonicalSlug], {
            replaceUrl: true,
          });
        }

        this.product = product;
        this.breadcrumbItems = [
          { label: 'Productos', routerLink: '/productos' },
          { label: product.name },
        ];
        this.loadRelatedProducts(product.id);
        this.isLoading = false;
        this.flushView();
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar el producto.';
        this.product = null;
        this.relatedProducts = [];
        this.breadcrumbItems = [];
        this.selectedOptions = {};
        this.quantity = 1;
        this.isLoading = false;
        this.flushView();
      },
    });
  }

  private loadRelatedProducts(currentProductId: string): void {
    this.apiService.searchProducts().subscribe({
      next: (response) => {
        this.relatedProducts = response.products.filter(
          (p) => p.id !== currentProductId,
        );
        this.flushView();
        requestAnimationFrame(() => this.initializeRelatedSwiper());
      },
      error: (err) => {
        console.warn('Error loading related products:', err);
        this.relatedProducts = [];
        this.flushView();
      },
    });
  }

  private flushView(): void {
    this.cdr.markForCheck();
    const ngGlobal = globalThis as {
      ng?: { applyChanges?: (component: unknown) => void };
    };
    ngGlobal.ng?.applyChanges?.(this);
  }

  private initializeRelatedSwiper(): void {
    try {
      if (!this.relatedSwiperRef?.nativeElement) return;
      const params = {
        slidesPerView: 2,
        spaceBetween: 20,
        pagination: {
          clickable: true,
          el: '.swiper-related',
          renderBullet: (_index: number, className: string) =>
            `<span class="${className}"></span>`,
        },
        lazy: false,
        breakpoints: {
          760: { slidesPerView: 3, spaceBetween: 30 },
          1024: { slidesPerView: 4, spaceBetween: 30 },
        },
      };
      Object.assign(this.relatedSwiperRef.nativeElement, params);
      this.relatedSwiperRef.nativeElement.initialize();
    } catch (error) {
      console.warn('Failed to initialize related swiper:', error);
    }
  }

  private preSelectFirstOptions(): void {
    if (!this.product?.options.length) return;
    const initial: Record<string, string> = {};
    for (const option of this.product.options) {
      if (option.values.length > 0) {
        const first = [...option.values].sort(
          (a, b) => a.displayOrder - b.displayOrder,
        )[0];
        initial[option.name] = first.value;
      }
    }
    this.selectedOptions = initial;
  }
}
