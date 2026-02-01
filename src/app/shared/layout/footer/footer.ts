import {Component, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule} from '@angular/common';
import {CategoryService} from '../../services/category';
import {Router, RouterLink, RouterModule} from '@angular/router';
import {Observable} from 'rxjs';
import {CategoryType} from '../../../../types/category.type';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [AsyncPipe, RouterModule, CommonModule],
  templateUrl: './footer.html', // Убедись, что файл называется так
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  categories$!: Observable<CategoryType[]>;

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categories$ = this.categoryService.getCategories();
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
}
