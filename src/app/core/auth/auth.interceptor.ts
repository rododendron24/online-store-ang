//
// import { Injectable } from '@angular/core';
// import {HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse} from '@angular/common/http';
// import {AuthService} from './auth';
// import {catchError, throwError} from 'rxjs';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(private authService: AuthService) {
//   }
//
//   intercept(req: HttpRequest<any>, next: HttpHandler) {
//     // Пропускаем запросы авторизации
//     if (req.url.includes('login') || req.url.includes('signup') || req.url.includes('refresh')) {
//       return next.handle(req);
//     }
//
//     const tokens = this.authService.getTokens();
//
//     if (tokens && tokens.accessToken) {
//       // Формат: Bearer <token>
//       req = req.clone({
//         setHeaders: {
//           Authorization: `Bearer ${tokens.accessToken}`
//         }
//       });
//
//       console.log('Access token добавлен');
//
//       // Если сервер также требует refresh token в теле/заголовках
//       if (tokens.refreshToken && req.method === 'POST') {
//         // Для некоторых API может потребоваться
//         const bodyWithRefreshToken = {
//           ...req.body,
//           refreshToken: tokens.refreshToken
//         };
//
//         req = req.clone({
//           body: bodyWithRefreshToken
//         });
//       }
//     }
//
//     return next.handle(req).pipe(
//       catchError((error: HttpErrorResponse) => {
//         if (error.status === 401) {
//           // Попробовать обновить токен
//           console.log('Токен истек, пробуем refresh...');
//           // Здесь можно добавить логику refresh token
//         }
//         return throwError(() => error);
//       })
//     );
//   }
// }

// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {AuthService} from './auth';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔄 AuthInterceptor сработал для:', req.url);

  const authService = inject(AuthService);

  // Пропускаем запросы авторизации
  const skipUrls = ['login', 'signup', 'refresh'];
  const shouldSkip = skipUrls.some(url => req.url.includes(url));

  if (shouldSkip) {
    console.log('⏭️ Пропускаем (auth endpoint)');
    return next(req);
  }

  const tokens = authService.getTokens();
  console.log('Токены из сервиса:', {
    accessToken: tokens?.accessToken ? `✅ (${tokens.accessToken?.length} символов)` : '❌ Нет',
    refreshToken: tokens?.refreshToken ? '✅ Есть' : '❌ Нет'
  });

  if (tokens && tokens.accessToken) {
    console.log('🔑 Добавляем Bearer токен');

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });

    console.log('Заголовок Authorization добавлен');

    return next(authReq);
  }

  console.log('⚠️ Отправляем запрос без токена');
  return next(req);
};
