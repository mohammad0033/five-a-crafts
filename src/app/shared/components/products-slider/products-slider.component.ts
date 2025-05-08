import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {NgxSplideModule} from 'ngx-splide';
import {NgForOf, NgIf} from '@angular/common';
import {ProductCardComponent} from '../product-card/product-card.component';

@UntilDestroy()
@Component({
  selector: 'app-products-slider',
  imports: [
    NgxSplideModule,
    NgForOf,
    NgIf,
    ProductCardComponent
  ],
  templateUrl: './products-slider.component.html',
  standalone: true,
  styleUrl: './products-slider.component.scss'
})
export class ProductsSliderComponent implements OnInit{
  @Input() products: any
  currentLang!: string
  splideOptions = {
    height: '38rem',
    perPage: 4,
    perMove: 1,
    gap: '1rem',
    autoplay: false,
    pagination: false,
    breakpoints: {
      1200: {
        perPage: 3,
      },
      992: {
        perPage: 2,
      },
      768: {
        height: 'auto',
      }
    }
  };

  rtlSplideOptions = {
    ...this.splideOptions,
    direction: "rtl" as "rtl"
  }

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
    })
  }
}
