// import {Component, OnInit} from '@angular/core';
// import {HttpClient} from '@angular/common/http';
// import {FavoriteService} from '../../../shared/services/favorite';
// import {FavoritesType} from '../../../../types/favorites.type';
// import {DefaultResponseType} from '../../../../types/default-response.type';
// import {NgForOf} from '@angular/common';
// import {RouterLink} from '@angular/router';
//
// @Component({
//   selector: 'app-favorite',
//   standalone: true,
//   imports: [
//    //NgForOf,
//     //RouterLink
//   ],
//   //templateUrl: './favorite.html',
//   template: `
//     <div style="color: red; font-size: 24px;">
//       ТЕСТ: Компонент Favorite загружен!
//     </div>
//     <div *ngIf="true">
//       Статичный заголовок: Мои избранные товары
//     </div>
//   `,
//   styleUrl: './favorite.scss',
// })
// export class Favorite implements OnInit {
//   // favproducts: FavoritesType[] = [];
//   // readonly serverStaticPath = 'http://localhost:3000/images/products/';
//   // constructor(private http: HttpClient, private favoriteService: FavoriteService) {}
//
// //   ngOnInit(): void {
// //       this.favoriteService.getFavorites()
// //         .subscribe((data: FavoritesType[] | DefaultResponseType) => {
// // if ((data as DefaultResponseType).error !== undefined) {
// //   const  error = (data as DefaultResponseType).message;
// //   throw new Error(error);
// // }
// // this.favproducts = data as FavoritesType[];
// //         });
// //     }
//
//   ngOnInit() {
//     console.log('Компонент Favorite инициализирован!');
//   }
//
//   removeFromFavorites(id: string) {
//
//   }
//
//   // removeFromFavorites(productId: string) {
//   //   this.favoriteService.removeFavorite(productId).subscribe({
//   //     next: () => {
//   //       // Убираем товар из списка
//   //       this.favproducts = this.favproducts.filter(fav => fav.product.id !== productId);
//   //     },
//   //     error: (err) => {
//   //       console.error('Ошибка удаления из избранного:', err);
//   //     }
//   //   });
//   // }
// }

//2 вариант
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';
// import {FavoritesType} from '../../../../types/favorites.type';
// import {FavoriteService} from '../../../shared/services/favorite';
// import {AuthService} from '../../../core/auth/auth';
// import {DefaultResponseType} from '../../../../types/default-response.type';
//
// @Component({
//   selector: 'app-favorite',
//   standalone: true,
//   imports: [
//     CommonModule,
//   ],
//   templateUrl: './favorite.html',
//   styleUrl: './favorite.scss',
// })
//
// export class Favorite implements OnInit {
//   favproducts: FavoritesType[] = [];
//   readonly serverStaticPath = 'http://localhost:3000/images/products/';
//   isLoading = true;
//   errorMessage = '';
//
//   constructor(private favoriteService: FavoriteService, private authService: AuthService) {
//     console.log('✅ Конструктор Favorite вызван');
//   }
//
//   ngOnInit(): void {
//     console.log('=== ПРОВЕРКА АВТОРИЗАЦИИ ===');
//
//     // Проверка 1: Токены в localStorage
//     const accessToken = localStorage.getItem('accessToken');
//     const refreshToken = localStorage.getItem('refreshToken');
//     console.log('Access token в localStorage:', accessToken ? '✅ Есть' : '❌ Нет');
//     console.log('Refresh token в localStorage:', refreshToken ? '✅ Есть' : '❌ Нет');
//
//     // Проверка 2: Через AuthService
//     const tokens = this.authService.getTokens();
//     console.log('Токены через AuthService:', tokens);
//
//     // Проверка 3: Состояние isLogged
//     console.log('isLogged через сервис:', this.authService.getIsLoggedIn());
//
//     // Если нет токена - редирект на логин
//     if (!accessToken) {
//       console.error('❌ Нет access token! Редирект на логин...');
//       // window.location.href = '/login';
//       this.errorMessage = 'Требуется авторизация';
//       return;
//     }
//
//     // Проверка 4: Валидность JWT токена
//     this.checkTokenValidity(accessToken);
//
//     console.log('=== НАЧИНАЕМ ЗАГРУЗКУ ===');
//     this.loadFavorites();
//   }
//
//   private checkTokenValidity(token: string): void {
//     try {
//       const parts = token.split('.');
//       if (parts.length === 3) {
//         const payload = JSON.parse(atob(parts[1]));
//         console.log('📋 Информация из токена:');
//         console.log('  User ID:', payload.id);
//         console.log('  Email:', payload.email);
//         console.log('  Выдан:', new Date(payload.iat * 1000).toLocaleString());
//         console.log('  Истекает:', new Date(payload.exp * 1000).toLocaleString());
//
//         const isExpired = Date.now() > payload.exp * 1000;
//         console.log('  Токен истек?', isExpired ? '❌ ДА' : '✅ Нет');
//
//         if (isExpired) {
//           this.errorMessage = 'Токен истек. Войдите заново.';
//         }
//       }
//     } catch (e) {
//       console.error('❌ Ошибка декодирования токена:', e);
//     }
//   }
//
//   loadFavorites(): void {
//     console.log('🔄 loadFavorites() начал выполнение');
//     this.isLoading = true;
//     this.errorMessage = '';
//
//     // Проверка - работает ли сервис
//     console.log('Сервис доступен?', !!this.favoriteService);
//
//     this.favoriteService.getFavorites()
//       .subscribe({
//         next: (data) => {
//           console.log('✅ Данные получены:', data);
//
//           if (Array.isArray(data)) {
//             this.favproducts = data;
//             console.log(`✅ Загружено ${data.length} товаров`);
//           } else if (data && typeof data === 'object' && data.error) {
//             this.errorMessage = data.message;
//             console.warn('⚠️ Ошибка от сервера:', data.message);
//           }
//
//           this.isLoading = false;
//           console.log('✅ Загрузка завершена');
//         },
//         error: (error) => {
//           console.error('❌ Ошибка в subscribe:', error);
//           this.errorMessage = 'Ошибка загрузки данных';
//           this.isLoading = false;
//         },
//         complete: () => {
//           console.log('✅ Observable завершен');
//         }
//       });
//
//     console.log('🔄 Подписка создана');
//   }
//
//   testAuth(): void {
//     console.log('🔐 ТЕСТ АВТОРИЗАЦИИ');
//
//     // 1. Простой запрос, который должен работать
//     fetch('http://localhost:3000/api/user', {
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
//       }
//     })
//       .then(response => {
//         console.log('Тест /user - статус:', response.status);
//         return response.json();
//       })
//       .then(data => {
//         console.log('Тест /user - данные:', data);
//       })
//       .catch(error => {
//         console.error('Тест /user - ошибка:', error);
//       });
//
//     // 2. Запрос без токена (для сравнения)
//     fetch('http://localhost:3000/api/user')
//       .then(response => {
//         console.log('Тест /user без токена - статус:', response.status);
//       })
//       .catch(error => {
//         console.error('Тест /user без токена - ошибка:', error);
//       });
//   }
// }


//Исходный вариант
import {Component, OnInit} from '@angular/core';
import {NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FavoritesType} from '../../../../types/favorites.type';
import {HttpClient} from '@angular/common/http';
import {FavoriteService} from '../../../shared/services/favorite';
import {DefaultResponseType} from '../../../../types/default-response.type';

@Component({
  selector: 'app-favorite',
  imports: [
    NgForOf,
    RouterLink
  ],
  templateUrl: './favorite.html',
  styleUrl: './favorite.scss',
})
export class Favorite implements OnInit {
  favproducts: FavoritesType[] = [];
  readonly serverStaticPath = 'http://localhost:3000/images/products/';
  constructor(private http: HttpClient, private favoriteService: FavoriteService) {}

  // ngOnInit(): void {
  //   this.favoriteService.getFavorites()
  //     .subscribe((data: FavoritesType[] | DefaultResponseType) => {
  //       if ((data as DefaultResponseType).error !== undefined) {
  //         const  error = (data as DefaultResponseType).message;
  //         throw new Error(error);
  //       }
  //       this.favproducts = data as FavoritesType[];
  //     });
  // }

  ngOnInit(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (data: FavoritesType[] | DefaultResponseType) => {
        if ('error' in data && data.error) {
          console.error('Ошибка от сервера:', data.message);
          // можно показать сообщение пользователю
          return;
        }
        this.favproducts = data as FavoritesType[];
      },
      error: (err) => {
        console.error('Ошибка запроса избранного:', err);
        // если 500 или 401 — можно разлогинить или показать ошибку
      }
    });
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFromFavorites(id).subscribe({
      next: () => {
        this.favproducts = this.favproducts.filter(p => p.id !== id);
      },
      error: err => console.error('Ошибка удаления:', err)
    });
  }
}
