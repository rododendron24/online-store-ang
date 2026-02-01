import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from '../../../shared/services/product';
import {AsyncPipe, CommonModule} from '@angular/common';
import {ActivatedRoute, Params, Router, RouterModule} from '@angular/router';
import {
  auditTime, combineLatest, concat, concatMap,
  count,
  debounceTime,
  distinctUntilChanged, EMPTY,
  map, mergeMap,
  Observable, of, pairwise,
  shareReplay, skip, startWith,
  Subscription,
  switchMap, take,
  tap
} from 'rxjs';
import {ProductType} from '../../../../types/product.type';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CategoryService} from '../../../shared/services/category';
import {CategoryWithTypeType} from '../../../../types/category-with-type.type';
import {CategoryFilter} from '../../../shared/components/category-filter/category-filter';
import {ActiveParamsUtil} from '../../../shared/utils/active-params.util';
import {ActiveParamsType} from '../../../../types/active-params.type';
import {AppliedFilterType} from '../../../../types/applied-filter.type';
import {ProductCard} from '../../../shared/components/product-card/product-card';
import {CartService} from '../../../shared/services/cart';
import {CartType} from '../../../../types/cart.type';


@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    RouterModule, CommonModule, AsyncPipe, ReactiveFormsModule, FormsModule, CategoryFilter, ProductCard
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog implements OnInit, OnDestroy {
  activeParams: ActiveParamsType = {types: []};
  appliedFilters: AppliedFilterType[] = [];
  sortingOpen = false;

  readonly serverStaticPath = 'http://localhost:3000/images/products/';
  productCount: number = 1;

  // Используем один shared Observable
  allproducts$!: Observable<{ totalCount: number, pages: number, items: ProductType[] }>;
  categoriesWithTypes$!: Observable<CategoryWithTypeType[]>;

  // Дополнительные потоки как производные от основного
  products$!: Observable<ProductType[]>;
  totalCount$!: Observable<number>;
  pages$!: Observable<number[]>;
  cart: CartType | null = null;
//@Input() countInCart: number = 0;
  categoriesWithTypes: CategoryWithTypeType[] = [];

  // Добавляем подписку для управления
  private subscriptions: Subscription = new Subscription();
  cart$: Observable<CartType | null> | undefined;

  sortingOptions: { name: string, value: string }[] = [
    {name: 'От А до Я', value: 'az-asc'},
    {name: 'От Я до А', value: 'az-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'},
  ];

  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private cartService: CartService,
              private router: Router) {
  }


  ngOnInit(): void {
    // this.cartService.getCart()
    //   .subscribe((data: CartType) => {
    //     this.cart = data;
    //   });

    this.cart$ = this.cartService.getCart().pipe(
      startWith(null),
      shareReplay({bufferSize: 1, refCount: true})
    );

    // Подписываемся на категории один раз
    this.categoriesWithTypes$ = this.categoryService.getCategoriesWithTypes();

    // Подписываемся и сохраняем категории
    this.subscriptions.add(
      this.categoriesWithTypes$.subscribe(data => {
        this.categoriesWithTypes = data;
        // Теперь обновление фильтров будет происходить в основном потоке queryParams
      })
    );

    // Отдельная подписка на queryParams для обновления appliedFilters
    this.subscriptions.add(
      this.activatedRoute.queryParams.subscribe(params => {
        this.activeParams = ActiveParamsUtil.processParams(params);
        this.updateAppliedFilters();
      })
    );

    // Создаем один Observable для продуктов
    // this.allproducts$ = this.activatedRoute.queryParams.pipe(
    //   debounceTime(500), // Можно добавить задержку для предотвращения множественных запросов при быстром изменении фильтров
    //   distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
    //   switchMap(params => this.productService.getProducts(params)),
    //   shareReplay({ bufferSize: 1, refCount: true })
    // );

    // Создаем один Observable для продуктов вариант2
    this.allproducts$ = concat(
      // Первое (начальное) значение queryParams — без задержки
      this.activatedRoute.queryParams.pipe(
        take(1),
        switchMap(params => this.productService.getProducts(params))
      ),
      // Все последующие изменения — с debounce
      this.activatedRoute.queryParams.pipe(
        skip(1),
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        switchMap(params => this.productService.getProducts(params))
      )
    ).pipe(
      // После получения продуктов, ждём корзину и обогащаем
      switchMap(data =>
        this.cartService.getCart().pipe(
          map(cart => {
            if (!cart || !cart.items || cart.items.length === 0) {
              return {
                ...data,
                items: data.items.map(p => ({...p, countInCart: undefined}))
              };
            }
            return {
              ...data,
              items: data.items.map(product => {
                const itemInCart = cart.items.find(item => item.product.id === product.id);
                return itemInCart ? {...product, countInCart: itemInCart.quantity} : {
                  ...product,
                  countInCart: undefined
                };
              })
            };
          }),
          startWith({...data, items: data.items.map(p => ({...p, countInCart: undefined}))}) // временный fallback
        )
      ),
      shareReplay({bufferSize: 1, refCount: true})
    );

    //конец 2 варианта

    this.products$ = this.allproducts$.pipe(
      map(data => data.items),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // Создаём производные Observable
    // this.products$ = this.allproducts$.pipe(
    //   map(data => data.items),
    //   shareReplay({bufferSize: 1, refCount: true})
    // );

    // this.products$ = combineLatest([
    //   this.allproducts$,
    //   this.cart$
    //     ]).pipe(
    //     map(([data, cart]) => {
    //     if (!cart || !cart.items || cart.items.length === 0) {
    //       return data.items; // без изменений
    //     }
    //
    //     return data.items.map(product => {
    //       const itemInCart = cart.items.find(item => item.product.id === product.id);
    //       if (itemInCart) {
    //         return {
    //           ...product,
    //           countInCart: itemInCart.quantity
    //         };
    //       }
    //       return product;
    //     });
    //   }),
    //   shareReplay({bufferSize: 1, refCount: true})
    // );

    this.totalCount$ = this.allproducts$.pipe(
      map(data => data.totalCount),
      shareReplay({bufferSize: 1, refCount: true})
    );

    this.pages$ = this.allproducts$.pipe(
      map(data => {
        const totalPages = data.pages || 0;
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
        return pages;
      }),
      shareReplay({bufferSize: 1, refCount: true})
    );

    // Для отладки - один раз подписываемся на результат
    this.subscriptions.add(
      this.allproducts$.subscribe({
        next: data => console.log('Данные получены:', data),
        error: err => console.error('Ошибка:', err)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateAppliedFilters(): void {
    this.appliedFilters = [];

    // Проверяем, что categoriesWithTypes уже загружены
    if (this.categoriesWithTypes.length === 0) {
      console.log('Категории еще не загружены, откладываем обновление фильтров');
      return;
    }

    console.log('Обновляем фильтры с активными параметрами:', this.activeParams);
    console.log('Доступные категории:', this.categoriesWithTypes.length);

    // Обрабатываем типы
    this.activeParams.types?.forEach(url => {
      let filterFound = false;

      for (let i = 0; i < this.categoriesWithTypes.length; i++) {
        const foundType = this.categoriesWithTypes[i].types.find(type => type.url === url);
        if (foundType) {
          this.appliedFilters.push({
            name: foundType.name,
            urlParam: foundType.url
          });
          filterFound = true;
          break;
        }
      }

      if (!filterFound) {
        console.warn('Не найден тип с URL:', url);
      }
    });

    // Обрабатываем высоту
    if (this.activeParams.heightFrom) {
      this.appliedFilters.push({
        name: 'Высота: от ' + this.activeParams.heightFrom + ' см',
        urlParam: 'heightFrom'
      });
    }

    if (this.activeParams.heightTo) {
      this.appliedFilters.push({
        name: 'Высота: до ' + this.activeParams.heightTo + ' см',
        urlParam: 'heightTo'
      });
    }

    // Обрабатываем диаметр
    if (this.activeParams.diameterFrom) {
      this.appliedFilters.push({
        name: 'Диаметр: от ' + this.activeParams.diameterFrom + ' см',
        urlParam: 'diameterFrom'
      });
    }

    if (this.activeParams.diameterTo) {
      this.appliedFilters.push({
        name: 'Диаметр: до ' + this.activeParams.diameterTo + ' см',
        urlParam: 'diameterTo'
      });
    }

    console.log('Примененные фильтры:', this.appliedFilters);
  }

  refresh(): void {
    this.productService.clearCache();
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType) {
    console.log('Удаляем фильтр:', appliedFilter);

    if (
      appliedFilter.urlParam === 'heightFrom' ||
      appliedFilter.urlParam === 'heightTo' ||
      appliedFilter.urlParam === 'diameterFrom' ||
      appliedFilter.urlParam === 'diameterTo'
    ) {
      delete this.activeParams[appliedFilter.urlParam];
    } else {
      this.activeParams.types = this.activeParams.types?.filter(item => item !== appliedFilter.urlParam) || [];
    }
    this.activeParams.page = 1;

    console.log('Новые параметры после удаления:', this.activeParams);

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  toggleSorting() {
    this.sortingOpen = !this.sortingOpen;
  }

  sort(value: string) {
    this.activeParams.sort = value;
    this.sortingOpen = false;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  openPage(page: number): void {
    this.activeParams.page = page;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  onFilterChange(activeParams: ActiveParamsType): void {
    // Создаем копию, чтобы не модифицировать исходный объект
    const newParams = {...activeParams};
    newParams.page = 1;

    console.log('Изменение фильтра, новые параметры:', newParams);

    this.router.navigate(['/catalog'], {
      queryParams: newParams
    });
  }
}
