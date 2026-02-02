import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {CategoryService} from '../../services/category';
import {Observable} from 'rxjs';
import {CategoryType} from '../../../../types/category.type';
import {AuthService} from '../../../core/auth/auth';
import {MatMenu, MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {inject} from 'vitest';
import {CartService} from '../../services/cart';
import {AsyncPipe, CommonModule} from '@angular/common';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, CommonModule, RouterModule, MatMenuTrigger, MatMenu, MatButtonModule, MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  isLogged: boolean = false;
  categories$!: Observable<CategoryType[]>;
  count$!: Observable<number>; // Теперь используем Observable

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private cartService: CartService,
    private router: Router
  ) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit() {
    this.categories$ = this.categoryService.getCategories();
    this.count$ = this.cartService.getCartCount(); // Получаем Observable

    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    });
  }

    // Метод для обработки клика по категории
  onCategoryClick(categoryUrl: string, event: Event): void {
    event.preventDefault(); // Предотвращаем стандартное поведение ссылки

    this.categoryService.getCategoryTypeUrls(categoryUrl).subscribe(typeUrls => {
      if (typeUrls.length > 0) {
        // Создаем параметры с всеми типами категории
        const params = {
          types: typeUrls,
          page: 1
        };

        // Переходим в каталог с параметрами фильтрации
        this.router.navigate(['/catalog'], {
          queryParams: params
        });
      } else {
        // Если нет типов, просто переходим в каталог
        this.router.navigate(['/catalog']);
      }
    });
  }

  logout(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы', '', {
      duration: 3000,
    });
    this.router.navigate(['/']);
  }
}

//вариант 2
// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [AsyncPipe, CommonModule, RouterModule, MatMenuTrigger, MatMenu, MatButtonModule, MatMenuModule],
//   templateUrl: './header.html',
//   styleUrl: './header.scss',
// })
// export class Header implements OnInit {
//   isLogged: boolean = false;
//   categories$!: Observable<CategoryType[]>;
//   count: number = 0;
//
//   constructor(
//     private categoryService: CategoryService,
//     private authService: AuthService,
//     private _snackBar: MatSnackBar,
//     private cartService: CartService,
//     private router: Router
//   ) {
//     this.isLogged = this.authService.getIsLoggedIn();
//   }
//
//   ngOnInit() {
//     this.categories$ = this.categoryService.getCategories();
//
//     this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
//       this.isLogged = isLoggedIn;
//     });
//
//     this.cartService.getCartCount().subscribe(count => {
//       this.count = count;
//     });
//
//   }
//
//   // Метод для обработки клика по категории
//   onCategoryClick(categoryUrl: string, event: Event): void {
//     event.preventDefault(); // Предотвращаем стандартное поведение ссылки
//
//     this.categoryService.getCategoryTypeUrls(categoryUrl).subscribe(typeUrls => {
//       if (typeUrls.length > 0) {
//         // Создаем параметры с всеми типами категории
//         const params = {
//           types: typeUrls,
//           page: 1
//         };
//
//         // Переходим в каталог с параметрами фильтрации
//         this.router.navigate(['/catalog'], {
//           queryParams: params
//         });
//       } else {
//         // Если нет типов, просто переходим в каталог
//         this.router.navigate(['/catalog']);
//       }
//     });
//   }
//
//   logout(): void {
//     this.authService.logout()
//       .subscribe({
//         next: () => {
//           this.doLogout();
//         },
//         error: () => {
//           this.doLogout();
//         }
//       });
//   }
//
//   doLogout(): void {
//     this.authService.removeTokens();
//     this.authService.userId = null;
//     this._snackBar.open('Вы вышли из системы', '', {
//       duration: 3000,
//     });
//     this.router.navigate(['/']);
//   }
// }
