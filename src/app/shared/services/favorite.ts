// import { Injectable } from '@angular/core';
// import {catchError, Observable, of, tap} from 'rxjs';
// import {ProductType} from '../../../types/product.type';
// import {environment} from '../../../environments/environment';
// import {HttpClient, HttpErrorResponse} from '@angular/common/http';
// import {ActivatedRoute} from '@angular/router';
// import {FavoritesType} from '../../../types/favorites.type';
// import {DefaultResponseType} from '../../../types/default-response.type';

// @Injectable({
//   providedIn: 'root',
// })
// export class FavoriteService {
//   private productsCache: Map<string, Observable<{totalCount: number, pages: number, items: ProductType[]}>> = new Map();
//
//   constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {}
//
//
//   getFavorites(): Observable<FavoritesType[] | DefaultResponseType> {
//     return this.http.get<FavoritesType[] | DefaultResponseType>(environment.api + 'favorites');
//   }
//
//   // addFavorite(productId: string): Observable<FavoriteType | DefaultResponseType> {
//   //   return this.http.post<FavoriteType | DefaultResponseType>(environment.api + 'favorites', { productId });
//   // }
//   //
//   // removeFavorite(productId: string): Observable<DefaultResponseType> {
//   //   return this.http.delete<DefaultResponseType>(environment.api + 'favorites/' + productId);
//   // }
//   //
//   // toggleFavorite(productId: string): Observable<any> {
//   //   return this.http.post<DefaultResponseType>(environment.api + 'favorites/toggle', { productId });
//   // }
// }

//2 option
// @Injectable({
//   providedIn: 'root',
// })
// export class FavoriteService {
//   constructor(private http: HttpClient) {}
//
//   getFavorites(): Observable<FavoritesType[] | DefaultResponseType> {
//     console.log('Запрос избранного на URL:', environment.api + 'favorites');
//
//     return this.http.get<FavoritesType[] | DefaultResponseType>(environment.api + 'favorites')
//       .pipe(
//         tap(response => {
//           console.log('Ответ сервера:', response);
//         }),
//         catchError((error: HttpErrorResponse) => {
//           console.error('HTTP ошибка:', {
//             status: error.status,
//             message: error.message,
//             error: error.error
//           });
//
//           return of({
//             error: true,
//             message: `Ошибка ${error.status}: ${error.statusText}`
//           } as DefaultResponseType);
//         })
//       );
//   }
// }


//3 option
import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, delay, Observable, of, tap} from 'rxjs';
import {FavoritesType} from '../../../types/favorites.type';
import {DefaultResponseType} from '../../../types/default-response.type';
import {AuthService} from '../../core/auth/auth';
import {environment} from '../../../environments/environment';


// favorite.service.ts
@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  constructor(private http: HttpClient) {
    console.log('✅ FavoriteService создан');
  }

  getFavorites(): Observable<FavoritesType[] | DefaultResponseType> {
    console.log('🚀 getFavorites() вызван');

    // Добавим детальное логирование
    return this.http.get<FavoritesType[] | DefaultResponseType>(
      environment.api + 'favorites'
    ).pipe(
      tap({
        next: (response) => console.log('✅ Успешный ответ:', response),
        error: (error) => {
          console.error('❌ Детальная ошибка HTTP:');
          console.error('URL:', error.url);
          console.error('Status:', error.status);
          console.error('Status Text:', error.statusText);
          console.error('Error body:', error.error);
          console.error('Headers:', error.headers);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Проверяем, это ошибка авторизации или что-то другое
        if (error.status === 500 && error.error?.message?.includes('auth')) {
          console.warn('⚠️ Сервер говорит: проблема с авторизацией');

          // Проверяем токен в localStorage
          const token = localStorage.getItem('accessToken');
          console.log('Токен в localStorage:', token ? 'Есть' : 'Нет');
          if (token) {
            console.log('Длина токена:', token.length);
          }
        }

        return of({
          error: true,
          message: `Ошибка ${error.status}: ${error.error?.message || error.message}`
        } as DefaultResponseType);
      })
    );
  }
}
