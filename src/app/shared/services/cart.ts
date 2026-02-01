import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, map, Observable, of, shareReplay, tap} from 'rxjs';
import {CartType} from '../../../types/cart.type';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartType>({ items: [] });
  cart$ = this.cartSubject.asObservable();

  private countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();

  private totalAmountSubject = new BehaviorSubject<number>(0);
  totalAmount$ = this.totalAmountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Загрузи корзину при инициализации
    this.loadCart();
  }

  loadCart(): void {
    this.http.get<CartType>(environment.api + 'cart', { withCredentials: true }).subscribe({
      next: (cart) => {
        this.cartSubject.next(cart);
        this.updateDerivedValues(cart);
      },
      error: () => {
        this.cartSubject.next({ items: [] });
        this.updateDerivedValues({ items: [] });
      }
    });
  }

  getCart(): Observable<CartType> {
    return this.cart$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getCartCount(): Observable<number> {
    return this.count$;
  }

  getTotalAmount(): Observable<number> {
    return this.totalAmount$;
  }

  updateCart(productId: string, quantity: number): Observable<CartType> {
    return this.http.post<CartType>(environment.api + 'cart', { productId, quantity }, { withCredentials: true }).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.updateDerivedValues(cart);
      })
    );
  }

  private updateDerivedValues(cart: CartType): void {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    this.countSubject.next(count);
    this.totalAmountSubject.next(totalAmount);
  }
}
// @Injectable({
//   providedIn: 'root',
// })
// export class CartService {
//
//   count: number = 0;
//
//   constructor(private http: HttpClient) {
//   }
//
//   getCart(): Observable<CartType> {
//     return this.http.get<CartType>(environment.api + 'cart', {withCredentials: true});
//   }
//
//   // getCartCount(): Observable<{count: number}> {
//   //   return this.http.get<{count: number}>(environment.api + 'cart/count', {withCredentials: true})
//   //     .pipe(
//   //       tap(data => {
//   //         this.count = data.count;
//   //         console.log(this.count);
//   //       })
//   //     );
//   // }
//
//   getCartCount(): Observable<number> {
//     return this.http.get<{count: number}>(environment.api + 'cart/count', {withCredentials: true}).pipe(
//       map(data => data.count),
//       shareReplay({ bufferSize: 1, refCount: true })
//     );
//   }
//
//   // updateCart(productId: string, quantity: number): Observable<CartType> {
//   //   return this.http.post<CartType>(environment.api + 'cart', {productId, quantity}, {withCredentials: true})
//   //     .pipe(
//   //       tap(data => {
//   //         this.count = 0;
//   //         data.items.forEach(item => {
//   //           this.count += item.quantity;
//   //         });
//   //         console.log(this.count);
//   //       })
//   //     );
//   // }
//
//   updateCart(productId: string, quantity: number): Observable<CartType> {
//     return this.http.post<CartType>(environment.api + 'cart', {productId, quantity}, {withCredentials: true});
//   }
// }
