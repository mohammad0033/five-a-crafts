import {Component, OnInit} from '@angular/core';
import {NgbCarouselConfig, NgbCarouselModule} from '@ng-bootstrap/ng-bootstrap';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {CarouselItem} from '../../models/carousel-item';
import {HomeService} from '../../services/home.service';
import {NgForOf, NgIf} from '@angular/common';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {RouterLink} from '@angular/router';
import {SafeHtmlPipe} from '../../../../shared/pipes/safe-html.pipe';

@UntilDestroy()
@Component({
  selector: 'app-hero-carousel',
  imports: [
    NgbCarouselModule,
    NgForOf,
    NgIf,
    TranslatePipe,
    FaIconComponent,
    RouterLink,
    SafeHtmlPipe
  ],
  templateUrl: './hero-carousel.component.html',
  standalone: true,
  styleUrl: './hero-carousel.component.scss'
})
export class HeroCarouselComponent implements OnInit{
  carouselData: CarouselItem[] = [];
  currentLang!: string;

  constructor(
    private homeService: HomeService,
    private translate: TranslateService,
    config: NgbCarouselConfig) {
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

    this.currentLang = this.translate.currentLang

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event) => {
      this.currentLang = event.lang
    })
  }

  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;
}
