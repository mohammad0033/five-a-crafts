import {Component, OnInit} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ProductsSliderComponent} from '../../../../shared/components/products-slider/products-slider.component';
import {NgForOf, NgIf, SlicePipe} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ProductsApiService} from '../../../../core/services/products-api.service';
import {Product} from '../../../../core/models/product';
import {finalize} from 'rxjs';
import {ProductCardComponent} from '../../../../shared/components/product-card/product-card.component';
import {RouterLink} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';

@UntilDestroy()
@Component({
  selector: 'app-our-products',
  imports: [
    TranslatePipe,
    ProductsSliderComponent,
    NgIf,
    ProductCardComponent,
    NgForOf,
    SlicePipe,
    RouterLink,
    FaIconComponent
  ],
  templateUrl: './our-products.component.html',
  standalone: true,
  styleUrl: './our-products.component.scss'
})
export class OurProductsComponent implements OnInit {
  products : Product[] = []
  isLoading: boolean = true;
  currentLang!: string

  constructor(private productsApiService: ProductsApiService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event) => {
      this.currentLang = event.lang
    })
    this.isLoading = true;
    this.productsApiService.getBestSellingProducts()
      .pipe(
        untilDestroyed(this), // Use the untilDestroyed operator
        finalize(() => (this.isLoading = false)) // Set isLoading to false when the observable completes
      )
      .subscribe({
        next: (data) => {
          this.products = data;
          console.log('Best selling products loaded:', this.products);
        },
        error: (err) => {
          console.error('Error fetching best selling products:', err);
        }
      });
  }

  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;
}
