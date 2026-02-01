
import {Component, OnInit, ViewChild} from '@angular/core';
import {CountSelector} from '../../../shared/components/count-selector/count-selector';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {AsyncPipe, CommonModule} from '@angular/common';
import {CarouselModule, OwlOptions} from 'ngx-owl-carousel-o';
import {ProductCard} from '../../../shared/components/product-card/product-card';
import {ProductService} from '../../../shared/services/product';
import {Observable, shareReplay, switchMap} from 'rxjs';
import {ProductType} from '../../../../types/product.type';
import {CartType} from '../../../../types/cart.type';
import {CartService} from '../../../shared/services/cart';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CountSelector,
    AsyncPipe,
    CarouselModule,
    ProductCard,
    RouterLink,
    CommonModule
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {

  cart$!: Observable<CartType>;
  totalCount$!: Observable<number>;
  totalAmount$!: Observable<number>;

  @ViewChild('productsCarousel') productsCarousel!: any;

  extraProducts$!: Observable<ProductType[]>;
  //cart$!: Observable<CartType>;
  //cartData: CartType = { items: [] }; // для вычислений
  totalAmount = 0;
  totalCount = 0;

 // @ViewChild('productsCarousel') productsCarousel!: any;

  //extraProducts$!: Observable<ProductType[]>;

  readonly serverStaticPath = 'http://localhost:3000/images/products/';

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private activatedRoute: ActivatedRoute
  ) {}

  // ngOnInit(): void {
  //   this.extraProducts$ = this.productService.getBestProducts();
  //
  //   // Подписываемся на корзину
  //   this.cart$ = this.cartService.getCart().pipe(
  //     shareReplay({ bufferSize: 1, refCount: true })
  //   );
  //
  //   this.cart$.subscribe(cart => {
  //     this.cartData = cart ?? { items: [] };
  //     this.calculateTotal();
  //   });
  // }

  // ngOnInit(): void {
  //   this.extraProducts$ = this.productService.getBestProducts();
  //
  //   this.cart$ = this.cartService.getCart().pipe(
  //     shareReplay({ bufferSize: 1, refCount: true })
  //   );
  //
  //   // Подписка для расчёта суммы — но лучше вынести в шаблон или использовать computed (Angular 16+)
  //   this.cart$.subscribe(cart => {
  //     this.calculateTotal(cart);
  //   });
  // }

  ngOnInit(): void {
    this.extraProducts$ = this.productService.getBestProducts();

    this.cart$ = this.cartService.getCart();
    this.totalCount$ = this.cartService.getCartCount();
    this.totalAmount$ = this.cartService.getTotalAmount();
  }

  // private calculateTotal(cart: CartType): void {
  //   this.totalAmount = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  //   this.totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  // }

  // updateQuantity(productId: string, quantity: number): void {
  //   if (quantity <= 0) {
  //     this.removeItem(productId);
  //     return;
  //   }
  //   this.cartService.updateCart(productId, quantity).subscribe({
  //     next: () => {
  //       // После обновления — повторно загружаем корзину, чтобы гарантировать свежие данные
  //       this.cart$ = this.cartService.getCart().pipe(
  //         shareReplay({ bufferSize: 1, refCount: true })
  //       );
  //       this.cart$.subscribe(cart => this.calculateTotal(cart));
  //     },
  //     error: err => console.error('Ошибка обновления количества:', err)
  //   });
  // }


  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.cartService.updateCart(productId, quantity).subscribe();
  }

  // removeItem(productId: string): void {
  //   this.cartService.updateCart(productId, 0).subscribe({
  //     next: () => {
  //       this.cart$ = this.cartService.getCart().pipe(
  //         shareReplay({ bufferSize: 1, refCount: true })
  //       );
  //       this.cart$.subscribe(cart => this.calculateTotal(cart));
  //     }
  //   });
  // }

  removeItem(productId: string): void {
    this.cartService.updateCart(productId, 0).subscribe();
  }

  // calculateTotal(): void {
  //   this.totalAmount = 0;
  //   this.totalCount = 0;
  //
  //   for (const item of this.cartData.items) {
  //     this.totalAmount += item.quantity * item.product.price;
  //     this.totalCount += item.quantity;
  //   }
  // }
  //
  // updateQuantity(productId: string, quantity: number): void {
  //   if (quantity <= 0) {
  //     this.removeItem(productId); // если 0 или меньше — удаляем
  //     return;
  //   }
  //   // this.cartService.updateCart(productId, quantity).subscribe(updatedCart => {
  //   //   this.cartData = updatedCart;
  //   //   this.calculateTotal();
  //   // });
  //   this.cartService.updateCart(productId, quantity).subscribe(updatedCart => {
  //     // Создаём новый объект, чтобы Angular заметил изменение
  //     this.cartData = { ...updatedCart, items: [...updatedCart.items] };
  //     this.calculateTotal();
  //   });
  // }
  //
  // removeItem(productId: string): void {
  //   this.cartService.updateCart(productId, 0).subscribe(updatedCart => {
  //     this.cartData = updatedCart;
  //     this.calculateTotal();
  //   });
  // }

  // Методы для продуктовой карусели
  prevProducts(): void {
    if (this.productsCarousel) {
      this.productsCarousel.prev?.();
    }
  }

  nextProducts(): void {
    if (this.productsCarousel) {
      this.productsCarousel.next?.();
    }
  }
}
