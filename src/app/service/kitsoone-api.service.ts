import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { slugify } from '../constants';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  ApiError,
  CartItemRequest,
  ProductListResponse,
  ProductResponse,
  SearchProductsRequest,
} from './models/api.models';
import { ConfigService } from './config.service';

export interface ProductQueryFilters {
  searchTerm?: string;
  categories?: string[];
  connectivity?: string[];
  colors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class KitsooneApiService {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);

  private get baseUrl(): string {
    return this.configService.appConfig?.apiUrl ?? '';
  }

  /**
   * Search products with filters and search term
   */
  public searchProducts(
    filters?: ProductQueryFilters,
  ): Observable<ProductListResponse> {
    const body: SearchProductsRequest = {
      searchTerm: filters?.searchTerm || '',
      categories: filters?.categories || [],
      connectivity: filters?.connectivity || [],
      colors: filters?.colors || [],
    };

    return this.http
      .post<ProductListResponse>(`${this.baseUrl}/api/products/search`, body)
      .pipe(catchError(this.handleError));
  }

  public getNewProducts(): Observable<ProductResponse[]> {
    return this.http
      .get<ProductResponse[]>(`${this.baseUrl}/api/products/latest`)
      .pipe(catchError(this.handleError));
  }

  public getProductById(id: string): Observable<ProductResponse> {
    return this.http
      .get<ProductResponse>(`${this.baseUrl}/api/products/${id}`)
      .pipe(catchError(this.handleError));
  }

  public getProductBySlug(slug: string): Observable<ProductResponse> {
    const normalizedSlug = slugify(slug);

    return this.searchProducts().pipe(
      map(({ products }) =>
        products.find((product) => slugify(product.name) === normalizedSlug),
      ),
      switchMap((product) =>
        product
          ? this.getProductById(product.id)
          : this.getProductById(slug).pipe(
              catchError(() =>
                throwError(
                  () =>
                    ({
                      message: 'Producto no encontrado.',
                      statusCode: 404,
                      details: { slug: normalizedSlug },
                    }) as ApiError,
                ),
              ),
            ),
      ),
    );
  }

  public saveProfile(
    name: string,
    dateOfBirth: string,
    email: string,
  ): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/api/me/profile`, {
        name,
        dateOfBirth,
        email,
      })
      .pipe(catchError(this.handleError));
  }

  /** Anonymous endpoint: creates the DB profile right after Cognito signUp, before the account is confirmed. */
  public registerProfile(
    cognitoSub: string,
    name: string,
    email: string,
    dateOfBirth: string,
  ): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/api/register/profile`, {
        cognitoSub,
        name,
        email,
        dateOfBirth,
      })
      .pipe(catchError(this.handleError));
  }

  public getCart(): Observable<CartItemRequest[]> {
    return this.http
      .get<CartItemRequest[]>(`${this.baseUrl}/api/me/cart`)
      .pipe(catchError(this.handleError));
  }

  public saveCart(items: CartItemRequest[]): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/api/me/cart`, items)
      .pipe(catchError(this.handleError));
  }

  public mergeCart(items: CartItemRequest[]): Observable<CartItemRequest[]> {
    return this.http
      .post<CartItemRequest[]>(`${this.baseUrl}/api/me/cart/merge`, items)
      .pipe(catchError(this.handleError));
  }

  /**
   * Generic error handler for HTTP requests
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let apiError: ApiError;

    console.error('Error Details:', {
      status: error.status,
      message: error.message,
      url: error.url,
      error: error.error,
    });

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      apiError = {
        message: error.error.message || 'An error occurred',
        statusCode: 0,
        details: error.error,
      };
    } else {
      // Server-side error
      const errorMessage =
        error.error?.message || error.message || 'Unknown server error';
      apiError = {
        message: errorMessage,
        statusCode: error.status,
        details: error.error,
      };
    }

    return throwError(() => apiError);
  };
}
