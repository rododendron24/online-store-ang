import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import {Header} from './header/header';
import {Footer} from './footer/footer';
import {CategoryType} from '../../../types/category.type';
import {CategoryService} from '../services/category';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Header, Footer, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class LayoutComponent {}
