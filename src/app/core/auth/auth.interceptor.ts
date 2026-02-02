
import { Injectable } from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent} from '@angular/common/http';
import {AuthService} from './auth';
import {catchError, Observable, switchMap, throwError} from 'rxjs';



@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false; // защита от множественных refresh

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Пропускаем запросы, где токен не нужен
    if (req.url.includes('login') || req.url.includes('signup') || req.url.includes('refresh')) {
      return next.handle(req);
    }

    const tokens = this.authService.getTokens();

    console.log(`[Interceptor] URL: ${req.url} | Method: ${req.method}`);

    let authReq = req;

    if (tokens?.accessToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      });
      console.log('[Interceptor] Access token добавлен');
    } else {
      console.warn('[Interceptor] Нет accessToken — запрос без авторизации');
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing && !req.url.includes('refresh')) {
          this.isRefreshing = true;

          console.log('[Interceptor] 401 → запускаем refresh');

          return this.authService.refreshToken().pipe(
            switchMap((newTokens: any) => {  // предполагаем, что refresh возвращает {accessToken, refreshToken}
              this.isRefreshing = false;

              if (newTokens?.accessToken) {
                // Обновляем токены в сервисе (если refreshToken() уже вызывает setTokens)
                // const tokens = this.authService.getTokens();
                const cloned = authReq.clone({
                  setHeaders: { Authorization: `Bearer ${newTokens.accessToken}` }
                });
                console.log('[Interceptor] Токен обновлён → повтор запроса');
                return next.handle(cloned);
              }
              return next.handle(authReq); // на всякий случай
            }),
            catchError(refreshErr => {
              this.isRefreshing = false;
              console.warn('[Interceptor] Refresh провалился → разлогиниваем');
              this.authService.removeTokens();
              // this.router.navigate(['/login']);  // если инжектишь Router
              return throwError(() => refreshErr);
            })
          );
        }

        // Все остальные ошибки (в т.ч. 500 от сервера)
        console.error('[Interceptor] Ошибка:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }
}

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
//       // if (tokens.refreshToken && req.method === 'POST') {
//       //   // Для некоторых API может потребоваться
//       //   const bodyWithRefreshToken = {
//       //     ...req.body,
//       //     refreshToken: tokens.refreshToken
//       //   };
//       //
//       //   req = req.clone({
//       //     body: bodyWithRefreshToken
//       //   });
//       // }
//     }
//
//     return next.handle(req).pipe(
//       catchError((error: HttpErrorResponse) => {
//         if (error.status === 401) {
//           // ← вот этот блок и вставляешь сюда
//           return this.authService.refreshToken().pipe(
//             switchMap(() => {
//               const tokens = this.authService.getTokens();
//               if (tokens?.accessToken) {
//                 req = req.clone({
//                   setHeaders: {Authorization: `Bearer ${tokens.accessToken}`}
//                 });
//               }
//               return next.handle(req);   // ← повторяем запрос с новым токеном
//             }),
//             catchError(refreshErr => {
//               console.warn('Не удалось обновить токен → разлогиниваем');
//               this.authService.removeTokens();
//               // Опционально: можно здесь сделать перенаправление на логин
//               // this.router.navigate(['/login']);  // если инжектишь Router
//               return throwError(() => refreshErr);
//             })
//           );
//         }
//
//         // все остальные ошибки просто пробрасываем дальше
//         return throwError(() => error);
//       })
//     );
//   }
// }

// auth.interceptor.ts
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import {AuthService} from './auth';
//
//
// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   console.log('🔄 AuthInterceptor сработал для:', req.url);
//
//   const authService = inject(AuthService);
//
//   // Пропускаем запросы авторизации
//   const skipUrls = ['login', 'signup', 'refresh'];
//   const shouldSkip = skipUrls.some(url => req.url.includes(url));
//
//   if (shouldSkip) {
//     console.log('⏭️ Пропускаем (auth endpoint)');
//     return next(req);
//   }
//
//   const tokens = authService.getTokens();
//   console.log('Токены из сервиса:', {
//     accessToken: tokens?.accessToken ? `✅ (${tokens.accessToken?.length} символов)` : '❌ Нет',
//     refreshToken: tokens?.refreshToken ? '✅ Есть' : '❌ Нет'
//   });
//
//   if (tokens && tokens.accessToken) {
//     console.log('🔑 Добавляем Bearer токен');
//
//     const authReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${tokens.accessToken}`
//       }
//     });
//
//     console.log('Заголовок Authorization добавлен');
//
//     return next(authReq);
//   }
//
//   console.log('⚠️ Отправляем запрос без токена');
//   return next(req);
// };
