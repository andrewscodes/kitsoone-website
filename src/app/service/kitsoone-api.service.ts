import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiError, ProductResponse } from './models/api.models';

@Injectable({
  providedIn: 'root',
})
export class KitsooneApiService {
  private readonly http = inject(HttpClient);

  // AWS Configuration
  private readonly baseUrl =
    'https://tb3ccmgnq5wmqasv7xbfil6w7q0rioau.lambda-url.us-east-2.on.aws';

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  /**
   * Get all products
   */
  public getProducts(): Observable<ProductResponse[]> {
    return this.http
      .get<ProductResponse[]>(`${this.baseUrl}/api/products`, {
        headers: this.headers,
      })
      .pipe(
        map((response) => {
          if (Array.isArray(response)) {
            return response;
          }
          // If response is wrapped in ApiResponse format
          if (response && typeof response === 'object' && 'data' in response) {
            return (response as { data: ProductResponse[] }).data || [];
          }
          return [];
        }),
        catchError(this.handleError),
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
