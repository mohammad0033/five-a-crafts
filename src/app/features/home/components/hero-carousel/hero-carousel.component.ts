import {Component, OnInit} from '@angular/core';
import {NgbCarouselConfig, NgbCarouselModule} from '@ng-bootstrap/ng-bootstrap';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {CarouselItem} from '../../models/carousel-item';
import {HomeService} from '../../services/home.service';
import {NgForOf, NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {RouterLink} from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-hero-carousel',
  imports: [
    NgbCarouselModule,
    NgForOf,
    NgIf,
    TranslatePipe,
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './hero-carousel.component.html',
  standalone: true,
  styleUrl: './hero-carousel.component.scss'
})
export class HeroCarouselComponent implements OnInit{
  carouselData: CarouselItem[] = [];

  constructor(
    private homeService: HomeService,
    config: NgbCarouselConfig) {
    // customize default values of carousels used by this component tree
    config.showNavigationArrows = false;
    config.interval = 3000;
  }

  ngOnInit(): void {
    this.homeService.getHeroCarouselData()
      .pipe(
        untilDestroyed(this) // Pipe the untilDestroyed operator
      )
      .subscribe(data => {
        this.carouselData = data;
        console.log('Carousel data loaded:', this.carouselData);
      });
  }

  protected readonly faArrowRight = faArrowRight;
}
