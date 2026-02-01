import {ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ProductType} from '../../../../types/product.type';
import {CarouselModule, OwlOptions} from 'ngx-owl-carousel-o';
import {Observable, shareReplay, Subscription, switchMap, take} from 'rxjs';
import {ProductService} from '../../../shared/services/product';
import {AsyncPipe, NgIf} from '@angular/common';
import {ProductCard} from '../../../shared/components/product-card/product-card';
import {ActivatedRoute} from '@angular/router';
import {CountSelector} from '../../../shared/components/count-selector/count-selector';
import {CartService} from '../../../shared/services/cart';


@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CarouselModule,
    AsyncPipe,
    ProductCard,
    NgIf,
    CountSelector,
  ],
  templateUrl: './detail.html',
  styleUrl: './detail.scss',
})
export class Detail implements OnInit {
  //@Input() product!: ProductType;
  product$!: Observable<ProductType>;
  products$!: Observable<ProductType[]>;
  readonly serverStaticPath = 'http://localhost:3000/images/products/';
  @ViewChild('productsCarousel') productsCarousel!: any;
  count: number = 1;
  isInCart: boolean = false;
  private subscriptions = new Subscription();

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

  constructor(private productService: ProductService,
              private activatedRoute: ActivatedRoute,
              private cartService: CartService, private cdr: ChangeDetectorRef) {}


  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['product'] && this.product$) {
  //     // Синхронизация состояния из product
  //     this.isInCart = !!this.product$.countInCart;
  //     this.count = this.product$.countInCart || 1;
  //     this.cdr.markForCheck(); // если используешь OnPush
  //   }
  // }
  ngOnInit(): void {
    this.products$ = this.productService.getBestProducts();

    // this.product$ = this.activatedRoute.paramMap.pipe(
    //   switchMap(params =>
    //     this.productService.getProduct(params.get('url')!)
    //   )
    // );

    this.product$ = this.activatedRoute.paramMap.pipe(
      switchMap(params => {
        const url = params.get('url');
        if (!url) {
          throw new Error('URL параметр не найден');
        }
        return this.productService.getProduct(url);
      }),
      shareReplay({ bufferSize: 1, refCount: true }) // ← КРИТИЧЕСКИ ВАЖНО!
    );

    this.subscriptions.add(
      this.product$.subscribe(product => {
        // Запрашиваем корзину и обновляем isInCart/count
        this.cartService.getCart().subscribe(cart => {
          const itemInCart = cart?.items?.find(i => i.product.id === product.id);
          this.isInCart = !!itemInCart;
          this.count = itemInCart?.quantity || 1;
          this.cdr.markForCheck();
        });
      })
    );


  }

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

  updateCount(value: number) {
    this.count = value;
    if (this.isInCart) {
      this.product$.pipe(
        take(1),
        switchMap(product => this.cartService.updateCart(product.id, this.count))
      ).subscribe(() => {
        this.cdr.detectChanges();
      });
    }
  }

  addToCart() {
    this.product$.pipe(
      take(1),
      switchMap(product => this.cartService.updateCart(product.id, this.count))
    ).subscribe({
      next: () => {
        this.isInCart = true;
        this.cdr.detectChanges();
      },
      error: err => console.error('Ошибка добавления в корзину:', err)
    });
  }

  removeFromCart() {
    this.product$.pipe(
      take(1),
      switchMap(product => this.cartService.updateCart(product.id, 0))
    ).subscribe(() => {
      this.isInCart = false;
      this.count = 1;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
