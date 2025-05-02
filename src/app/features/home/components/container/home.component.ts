import { Component } from '@angular/core';
import {HeroCarouselComponent} from '../hero-carousel/hero-carousel.component';
import {OurProductsComponent} from '../our-products/our-products.component';
import {HomeCategoriesComponent} from '../home-categories/components/container/home-categories.component';
import {OurCollectionsComponent} from '../our-collections/our-collections.component';
import {HomeContactComponent} from '../home-contact/home-contact.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroCarouselComponent,
    OurProductsComponent,
    HomeCategoriesComponent,
    OurCollectionsComponent,
    HomeContactComponent
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
