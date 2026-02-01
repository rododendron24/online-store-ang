import {ChangeDetectorRef, Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ProductType} from '../../../../types/product.type';
import {CommonModule, NgIf} from '@angular/common';
import {environment} from '../../../../environments/environment';
import {ProductService} from '../../services/product';
import {FormsModule} from '@angular/forms';
import {CountSelector} from '../count-selector/count-selector';
import {CartService} from '../../services/cart';
import {CartType} from '../../../../types/cart.type';

@Component({
  selector: 'product-card',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    FormsModule,
    CountSelector,
    CommonModule
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})

export class ProductCard implements OnInit {
  @Input() product!: ProductType;
  readonly serverStaticPath = 'http://localhost:3000/images/products/';
  count: number = 1;
  @Input() isLight: boolean = false;
  //isLight: boolean = false;
  isInCart: boolean = false;

  constructor(private cartService: CartService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.isInCart = !!this.product.countInCart;
      this.count = this.product.countInCart || 1;
      this.cdr.markForCheck();
    }
  }

  // updateCount(value: number) {
  //   this.count = value;
  //   if (this.isInCart) {
  //     this.cartService.updateCart(this.product.id, this.count).subscribe(() => {
  //       this.isInCart = true;
  //       this.cdr.detectChanges(); // сразу обновляем DOM
  //     });
  //   }
  // }

  updateCount(value: number) {
    this.count = value;
    // Всегда обновляем корзину, даже если товар уже в корзине
    this.cartService.updateCart(this.product.id, this.count).subscribe();
  }

  // addToCart() {
  //   this.cartService.updateCart(this.product.id, this.count).subscribe(() => {
  //     this.isInCart = true;
  //     this.cdr.detectChanges(); // сразу обновляем DOM
  //   });
  // }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count).subscribe(() => {
      this.isInCart = true;
    });
  }

  // removeFromCart() {
  //   this.cartService.updateCart(this.product.id, 0).subscribe(() => {
  //     this.isInCart = false;
  //     this.count = 1;
  //     this.cdr.detectChanges(); // сразу обновляем DOM
  //   });
  // }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0).subscribe(() => {
      this.isInCart = false;
      this.count = 1;
    });
  }

  testClick() {
    console.log('Кнопка реально сработала!');
  }
}

