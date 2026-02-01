import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, pipe, shareReplay, tap} from 'rxjs';
import {CategoryType} from '../../../types/category.type';
import {environment} from '../../../environments/environment';
import {TypeType} from '../../../types/type.type';
import {CategoryWithTypeType} from '../../../types/category-with-type.type';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private cachedCategories: CategoryType[] | null = null;
  private categories$: Observable<CategoryType[]> | null = null;
  private categoriesWithTypes$: Observable<CategoryWithTypeType[]> | null = null;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryType[]> {
    if (this.cachedCategories) {
      console.log('Возвращаем кэшированные категории');
      return of(this.cachedCategories);
    }

    if (this.categories$) {
      return this.categories$;
    }

    console.log('Делаем новый запрос категорий');
    this.categories$ = this.http.get<CategoryType[]>(environment.api + 'categories').pipe(
      tap(data => {
        console.log('Кэшируем категории:', data.length);
        this.cachedCategories = data;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return this.categories$;
  }

  clearCache(): void {
    this.cachedCategories = null;
    this.categories$ = null;
    this.categoriesWithTypes$ = null;
    console.log('Кэш категорий очищен');
  }

  getCategoriesWithTypes(): Observable<CategoryWithTypeType[]> {
    // Если уже есть кэшированный запрос
    if (this.categoriesWithTypes$) {
      return this.categoriesWithTypes$;
    }

    console.log('Делаем новый запрос категорий с типами');
    this.categoriesWithTypes$ = this.http.get<TypeType[]>(environment.api + 'types').pipe(
      map((items: TypeType[]) => {
        const array: CategoryWithTypeType[] = [];

        items.forEach((item: TypeType) => {
          const foundItem = array.find(arrayItem => arrayItem.url === item.category.url);

          if (foundItem) {
            foundItem.types.push({
              id: item.id,
              name: item.name,
              url: item.url,
            });
          } else {
            array.push({
              id: item.category.id,
              name: item.category.name,
              url: item.category.url,
              types: [{
                id: item.id,
                name: item.name,
                url: item.url,
              }]
            });
          }
        });

        return array;
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    return this.categoriesWithTypes$;
  }

  getCategoryTypeUrls(categoryUrl: string): Observable<string[]> {
    return this.getCategoriesWithTypes().pipe(
      map(categoriesWithTypes => {
        const category = categoriesWithTypes.find(c => c.url === categoryUrl);
        if (category && category.types) {
          return category.types.map(type => type.url);
        }
        return [];
      })
    );
  }

  // Метод для получения категории с типами по URL
  getCategoryWithTypesByUrl(categoryUrl: string): Observable<CategoryWithTypeType | null> {
    return this.getCategoriesWithTypes().pipe(
      map(categoriesWithTypes => {
        return categoriesWithTypes.find(c => c.url === categoryUrl) || null;
      })
    );
  }
}

// @Injectable({
//   providedIn: 'root',
// })
// export class CategoryService {
//   private cachedCategories: CategoryType[] | null = null;
//   private categories$: Observable<CategoryType[]> | null = null;
//
//   constructor(private http: HttpClient) {}
//
//   getCategories(): Observable<CategoryType[]> {
//     // Если данные уже в кэше - возвращаем их
//     if (this.cachedCategories) {
//       console.log('Возвращаем кэшированные категории');
//       return of(this.cachedCategories);
//     }
//
//     // Если запрос уже выполняется - возвращаем существующий Observable
//     if (this.categories$) {
//       return this.categories$;
//     }
//
//     // Делаем новый запрос
//     console.log('Делаем новый запрос категорий');
//     this.categories$ = this.http.get<CategoryType[]>(environment.api + 'categories').pipe(
//       tap(data => {
//         console.log('Кэшируем категории:', data.length);
//         this.cachedCategories = data;
//       }),
//       shareReplay(1) // Кэшируем результат Observable
//     );
//
//     return this.categories$;
//   }
//
//   // Метод для очистки кэша (например, после логина/логаута)
//   clearCache(): void {
//     this.cachedCategories = null;
//     this.categories$ = null;
//     console.log('Кэш категорий очищен');
//   }
//
//   getCategoriesWithTypes(): Observable<CategoryWithTypeType[]> {
//     return this.http.get<TypeType[]>(environment.api + 'types')
//     .pipe(
//       map((items: TypeType[]) => {
// const array: CategoryWithTypeType[] = [];
//
// items.forEach((item: TypeType) => {
//
//   const foundItem = array.find(arrayItem => arrayItem.url === item.category.url);
//
//   if (foundItem) {
//     foundItem.types.push({
//       id: item.id,
//       name: item.name,
//       url: item.url,
//     });
//   } else {
//     array.push({
//       id: item.category.id,
//       name: item.category.name,
//       url: item.category.url,
//       types: [{
//         id: item.id,
//         name: item.name,
//         url: item.url,
//       }]
//     });
//   }
// });
//
// return array;
//       })
//     )
//   }
// }
