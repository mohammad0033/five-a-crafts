import {Component, OnInit} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ProductsSliderComponent} from '../../../../shared/components/products-slider/products-slider.component';
import {NgForOf, NgIf, SlicePipe} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {Product} from '../../../../core/models/product';
import {finalize} from 'rxjs';
import {ProductCardComponent} from '../../../../shared/components/product-card/product-card.component';
import {RouterLink} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {FavoritesApiService} from '../../../../core/services/favorites-api.service';
import {HomeService} from '../../services/home.service';

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

  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;

  constructor(private homeService: HomeService,
              private favoritesApiService: FavoritesApiService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event) => {
      this.currentLang = event.lang
    })
    this.isLoading = true;
    this.homeService.getBestSellingProducts()
      .pipe(
        untilDestroyed(this), // Use the untilDestroyed operator
        finalize(() => (this.isLoading = false)) // Set isLoading to false when the observable completes
      )
      .subscribe({
        next: (data) => {
          console.log('Best selling products data:', data);
          this.products = data;
          console.log('Best selling products loaded:', this.products);
        },
        error: (err) => {
          console.error('Error fetching best selling products:', err);
        }
      });
  }

  handleFavoriteToggle(productToToggle: Product): void {
    console.log(`OurProductsComponent: Toggling favorite for ${productToToggle.title}`);
    this.favoritesApiService.toggleFavoriteWithAuthPrompt(productToToggle.id) // Use the new method
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (result) => {
          if (result.action === 'added' && result.product) {
            console.log(`OurProductsComponent: ${result.product.title} was added to favorites.`);
          } else if (result.action === 'removed') {
            console.log(`OurProductsComponent: ${productToToggle.title} (ID: ${result.productId}) was removed from favorites.`);
          }
        },
        error: (err) => console.error(`OurProductsComponent: Failed to toggle favorite for ${productToToggle.title}`, err)
        // No need to handle EMPTY case explicitly here unless specific UI feedback is needed for cancelled login
      });
  }
}
