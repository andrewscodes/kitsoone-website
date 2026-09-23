import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { ConfigService } from './config.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = inject(ConfigService).appConfig?.apiUrl ?? '';

  if (!apiUrl || !req.url.startsWith(apiUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);

  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
        return next(authReq);
      }
      return next(req);
    }),
  );
};
