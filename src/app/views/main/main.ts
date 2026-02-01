import {Component, OnInit, ViewChild} from '@angular/core';
import {RouterLink} from '@angular/router';
import {ProductCard} from '../../shared/components/product-card/product-card';
import {ProductService} from '../../shared/services/product';
import {ProductType} from '../../../types/product.type';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {CarouselComponent, CarouselModule, OwlOptions} from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    ProductCard,
    CarouselModule,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit {
  products$!: Observable<ProductType[]>;
  @ViewChild('productsCarousel') productsCarousel!: any;
  @ViewChild('reviewsCarousel') reviewsCarousel!: any;

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


  customOptionsRev: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 26,
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
      }
    },
    nav: false
  }


  reviews = [
    {
name: 'Ирина',
      image: 'irina.png',
      text: 'В ассортименте я встретила все комнатные растения, которые меня интересовали. Цены - лучшие в городе. Доставка - очень быстрая и с заботой о растениях.'
    },
    {
      name: 'Анастасия',
      image: 'nastya.png',
      text: 'Спасибо огромное! Цветок арека невероятно красив - просто бомба! От него все в восторге! Спасибо за сервис - все удобно сделано, доставили быстро. И милая открыточка приятным бонусом.'
    },
    {
      name: 'Илья',
      image: 'ilia.png',
      text: 'Магазин супер! Второй раз заказываю курьером, доставлено в лучшем виде. Ваш ассортимент комнатных растений впечатляет! Спасибо вам за хорошую работу!'
    },
    {
      name: 'Оля',
      image: 'rew1.png',
      text: 'Хочу поблагодарить всю команду за помощь в подборе подарка для моей мамы! Все просто в восторге от мини-сада!'
    },
    {
      name: 'Катя',
      image: 'rew2.png',
      text: 'Спасибо большое за мою обновлённую коллекцию суккулентов! Сервис просто на 5+: быстро, удобно, недорого. '
    },
    {
      name: 'Петр',
      image: 'rew3.png',
      text: 'Хочу поблагодарить консультанта Ирину за помощь в выборе цветка для моей жены.'
    }
  ]


  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products$ = this.productService.getBestProducts();
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

  // Методы для карусели отзывов
  prevReviews(): void {
    if (this.reviewsCarousel) {
      this.reviewsCarousel.prev?.();
    }
  }

  nextReviews(): void {
    if (this.reviewsCarousel) {
      this.reviewsCarousel.next?.();
    }
  }
}
