import { Component } from '@angular/core';
import {HeroCarouselComponent} from '../hero-carousel/hero-carousel.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroCarouselComponent
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
