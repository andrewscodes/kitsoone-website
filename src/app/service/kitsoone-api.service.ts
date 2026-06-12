import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { slugify } from '../constants';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  ApiError,
  ProductListResponse,
  ProductResponse,
  SearchProductsRequest,
} from './models/api.models';

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

  // AWS Configuration
  private readonly baseUrl =
    'https://tb3ccmgnq5wmqasv7xbfil6w7q0rioau.lambda-url.us-east-2.on.aws';

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
