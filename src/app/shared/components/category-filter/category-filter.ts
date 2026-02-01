import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CategoryWithTypeType} from '../../../../types/category-with-type.type';
import {NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ActiveParamsType} from '../../../../types/active-params.type';
import {FormsModule} from '@angular/forms';
import {ActiveParamsUtil} from '../../utils/active-params.util';

@Component({
  selector: 'category-filter',
  imports: [
    NgForOf,
    NgIf,
    FormsModule
  ],
  templateUrl: './category-filter.html',
  styleUrl: './category-filter.scss',
})
export class CategoryFilter implements OnInit {
  @Input() categoryWithTypes: CategoryWithTypeType | null = null;
  @Input() type: string | null = null;
  @Output() filterChange = new EventEmitter<ActiveParamsType>();

  open = false;
  activeParams: ActiveParamsType = {types: []};
  from: number | null = null;
  to: number | null = null;

//getter
  get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name
    } else if (this.type) {
      if (this.type === 'height') {
        return 'Высота';
      } else if (this.type === 'diameter') {
        return 'Диаметр';
      }
    }
    return '';
  }

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {

      this.activeParams = ActiveParamsUtil.processParams(params);


      if (this.type) {
        if (this.type === 'height') {
          this.open = !!(this.activeParams.heightFrom || this.activeParams.heightTo);

          this.from = this.activeParams.heightFrom ? +this.activeParams.heightFrom : null;
          this.to = this.activeParams.heightTo ? +this.activeParams.heightTo : null;

        } else if (this.type === 'diameter') {
          this.open = !!(this.activeParams.diameterFrom || this.activeParams.diameterTo);

          this.from = this.activeParams.diameterFrom ? +this.activeParams.diameterFrom : null;
          this.to = this.activeParams.diameterTo ? +this.activeParams.diameterTo : null;
        }
      } else {
        if (params['types']) {
          this.activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];
        }

        if (this.categoryWithTypes && this.categoryWithTypes.types && this.categoryWithTypes.types.length > 0) {
          // Проверяем, есть ли хоть один выбранный тип в этой категории
          const hasSelectedType = this.categoryWithTypes.types.some(type => {
            return this.activeParams.types.includes(type.url); // ← используем includes, он проще и безопаснее
          });

          this.open = hasSelectedType; // ← теперь open зависит от наличия выбранных типов
        }
      }
    });
  }

  toggle(): void {
    this.open = !this.open;
  }

  updateFilterParam(url: string, checked: boolean) {
    if (this.activeParams.types && this.activeParams.types.length > 0) {
      const existingTypeInParams = this.activeParams.types.find(item => item === url);
      if (existingTypeInParams && !checked) {
        this.activeParams.types = this.activeParams.types.filter(item => item !== url);
      } else if (!existingTypeInParams && checked) {
        //this.activeParams.types.push(url); - баг ангуляр с квери параметрами и push()
        this.activeParams.types = [...this.activeParams.types, url];
      }
    } else if (checked) {
      this.activeParams.types = [url];
    }

    this.activeParams.page = 1;
    // this.router.navigate(['/catalog'], {
    //   queryParams: this.activeParams
    // });

    // Отправляем событие родителю
    this.filterChange.emit(this.activeParams);
  }

  // updateFilterParamFromTo(param: string, value: string) {
  //   if (param === 'heightTo' || param === 'heightFrom' || param === 'diameterFrom' || param === 'diameterTo') {
  //     if (this.activeParams[param] && !value) {
  //       delete this.activeParams[param];
  //     } else {
  //       this.activeParams[param] = value;
  //     }
  //
  //     this.activeParams.page = 1;
  //     // this.router.navigate(['/catalog'], {
  //     //   queryParams: this.activeParams
  //     // });
  //
  //   }
  // }


  updateFilterParamFromTo(param: string, value: string) {
    if (param === 'heightTo' || param === 'heightFrom' || param === 'diameterFrom' || param === 'diameterTo') {
      if (this.activeParams[param] && !value) {
        delete this.activeParams[param];
      } else {
        this.activeParams[param] = value;
      }
      this.activeParams.page = 1;

      this.filterChange.emit(this.activeParams); // ← отправляем родителю
    }
  }
}
