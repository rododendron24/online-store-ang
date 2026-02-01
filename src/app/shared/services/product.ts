import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError, finalize, Observable, of, shareReplay, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ProductType} from '../../../types/product.type';
import {ActivatedRoute} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private cachedProducts: ProductType[] | null = null;
  private cachedAllProducts: {totalCount: number, pages: number, items: ProductType[]} | null = null;
  private products$: Observable<ProductType[]> | null = null;
  private allproducts$: Observable<{totalCount: number, pages: number, items: ProductType[]}> | null = null;

  // Кэш для запросов с параметрами
  private productsCache: Map<string, Observable<{totalCount: number, pages: number, items: ProductType[]}>> = new Map();

  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute) {}

  getBestProducts(): Observable<ProductType[]> {
    if (this.cachedProducts) {
      console.log('Возвращаем кэшированные лучшие товары');
      return of(this.cachedProducts);
    }

    if (this.products$) {
      return this.products$;
    }

    console.log('Делаем новый запрос лучших товаров');
    this.products$ = this.http.get<ProductType[]>(environment.api + 'products/best').pipe(
      tap(data => {
        console.log('Кэшируем лучшие товары:', data.length);
        this.cachedProducts = data;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return this.products$;
  }

  getProducts(params: any = {}): Observable<{totalCount: number, pages: number, items: ProductType[]}> {
    // Создаем ключ кэша из параметров
    const cacheKey = JSON.stringify(params);

    // Если уже есть запрос с такими параметрами в кэше
    if (this.productsCache.has(cacheKey)) {
      console.log('Возвращаем кэшированные продукты для параметров:', params);
      return this.productsCache.get(cacheKey)!;
    }

    const queryParams = new HttpParams({ fromObject: params });

    console.log('Делаем запрос продуктов с параметрами:', params);

    const request$ = this.http.get<{totalCount: number, pages: number, items: ProductType[]}>(
      environment.api + 'products',
      { params: queryParams }
    ).pipe(
      tap(data => {
        console.log('Продукты получены для параметров:', params);
        // Кэшируем результат для запросов без параметров (первоначальная загрузка)
        if (Object.keys(params).length === 0) {
          this.cachedAllProducts = data;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(error => {
        console.error('Ошибка при загрузке продуктов:', error);
        // Удаляем из кэша при ошибке
        this.productsCache.delete(cacheKey);
        return of({ totalCount: 0, pages: 0, items: [] });
      }),
      finalize(() => {
        // Автоматически удаляем из кэша когда нет подписчиков (refCount: true сделает это)
      })
    );

    // Сохраняем в кэш
    this.productsCache.set(cacheKey, request$);

    return request$;
  }

  getProduct(url: string): Observable<ProductType> {
return this.http.get<ProductType>(environment.api + 'products/' + url);
  }

  clearCache(): void {
    this.cachedProducts = null;
    this.cachedAllProducts = null;
    this.products$ = null;
    this.allproducts$ = null;
    this.productsCache.clear();
    console.log('Кэш продуктов очищен');
  }
}

