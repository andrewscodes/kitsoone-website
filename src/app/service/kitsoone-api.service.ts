import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ApiError,
  ProductListResponse,
  ProductResponse,
} from './models/api.models';

export interface ProductQueryFilters {
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
   * Get all products
   */
  public getProducts(
    filters?: ProductQueryFilters,
  ): Observable<ProductListResponse> {
    let params = new HttpParams();

    for (const category of filters?.categories ?? []) {
      params = params.append('categories', category);
    }
    for (const conn of filters?.connectivity ?? []) {
      params = params.append('connectivity', conn);
    }
    for (const color of filters?.colors ?? []) {
      params = params.append('colors', color);
    }

    return this.http
      .get<ProductListResponse>(`${this.baseUrl}/api/products`, { params })
      .pipe(catchError(this.handleError));
  }

  public getNewProducts(): Observable<ProductResponse[]> {
    return this.http
      .get<ProductResponse[]>(`${this.baseUrl}/api/products/latest`)
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
