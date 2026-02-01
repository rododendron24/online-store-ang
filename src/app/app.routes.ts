import { Routes } from '@angular/router';
import {LayoutComponent} from './shared/layout/layout';
import {Main} from './views/main/main';
import {Favorite} from './views/personal/favorite/favorite';
import {authForwardGuard} from './core/auth/auth-forward-guard';
import {authGuard} from './core/auth/auth-guard';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: Main },
      {
        path: 'login',
        loadComponent: () => import('./views/user/login/login')
          .then(m => m.Login),
        canActivate: [authForwardGuard]
      },
      {
        path: 'signup',
        loadComponent: () => import('./views/user/signup/signup')
          .then(m => m.Signup),
        canActivate: [authForwardGuard]
      },
      {
        path: 'catalog',
        loadComponent: () => import('./views/product/catalog/catalog')
          .then(m => m.Catalog),
        canActivate: []
      },
      {
        path: 'detail/:url',
        loadComponent: () => import('./views/product/detail/detail')
          .then(m => m.Detail),
        canActivate: []
      },
      {
        path: 'cart',
        loadComponent: () => import('./views/order/cart/cart')
          .then(m => m.Cart),
        canActivate: []
      },
      {
        path: 'order',
        loadComponent: () => import('./views/order/order/order')
          .then(m => m.Order),
        canActivate: []
      },
      {
        path: 'favorite',
        loadComponent: () => import('./views/personal/favorite/favorite')
          .then(m => m.Favorite),
        canActivate: [authGuard]
      },
      {
        path: 'orders',
        loadComponent: () => import('./views/personal/orders/orders')
          .then(m => m.Orders),
        canActivate: [authGuard]
      },
      {
        path: 'info',
        loadComponent: () => import('./views/personal/info/info')
          .then(m => m.Info),
        canActivate: [authGuard]
      },
    ]
  }
];
