import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ProductsApiService} from '../../../../core/services/products-api.service';
import {ProductCardComponent} from '../../../../shared/components/product-card/product-card.component';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {Observable} from 'rxjs';
import {Product} from '../../../../core/models/product';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ProductsSliderComponent} from '../../../../shared/components/products-slider/products-slider.component';
import {FavoritesApiService} from '../../../../core/services/favorites-api.service';

@UntilDestroy()
@Component({
  selector: 'app-favorites',
  imports: [
    TranslatePipe,
    ProductCardComponent,
    NgForOf,
    AsyncPipe,
    NgIf,
    ProductsSliderComponent
  ],
  templateUrl: './favorites.component.html',
  standalone: true,
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit, OnDestroy {
  products$!: Observable<Product[]>;
  isLoading$!: Observable<boolean>; // For loading state
  productsYouMayLike$!: Observable<Product[]>;

  constructor(
    private metaService: Meta,
    private productsApiService: ProductsApiService,
    private titleService: Title, // Optional: Inject Title if needed
    private translate: TranslateService, // Inject TranslateService for dynamic titles
    private favoritesApiService: FavoritesApiService // Inject FavoritesService
  ) {}

  ngOnInit(): void {
    this.setPageTitle(); // Set initial page title

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.setPageTitle();
    });

    // Add noindex tag to prevent search engine indexing
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    // Get favorite products from the FavoritesService
    this.products$ = this.favoritesApiService.favorites$;
    this.isLoading$ = this.favoritesApiService.isLoading$;
    this.favoritesApiService.loadFavorites(); // Trigger initial load or refresh

    // get you may also like
    this.productsYouMayLike$ = this.productsApiService.getProductsYouMayLike();
  }

  handleFavoriteToggle(productToToggle: Product): void {
    this.favoritesApiService.toggleFavorite(productToToggle.id)
      .pipe(untilDestroyed(this)) // Component subscribes to the toggle action
      .subscribe({
        next: (result) => {
          if (result.action === 'added' && result.product) {
            console.log(`${result.product.name} was added to favorites. List will refresh via service.`);
          } else if (result.action === 'removed') {
            // Using productToToggle.name here as the removed product object isn't always returned by remove ops
            console.log(`${productToToggle.name} (ID: ${result.productId}) was removed from favorites. List will refresh via service.`);
          }
          // The favorites list (products$) will update automatically because
          // toggleFavorite calls addFavorite/removeFavorite, which in turn call loadFavorites.
        },
        error: (err) => console.error(`Component: Failed to toggle favorite for ${productToToggle.name}`, err)
      });
  }

  private setPageTitle(): void {
    // Assuming you have a translation key like 'favorites.pageTitle'
    // Make sure to add 'favorites.pageTitle' to your translation files
    this.translate.get('favorites.pageTitle')
      .pipe(untilDestroyed(this))
      .subscribe((pageTitle: string) => {
        this.titleService.setTitle(pageTitle);
      });
  }

  ngOnDestroy(): void {
    // It's good practice to remove or reset the robots tag when leaving the component
    // This prevents it from potentially persisting if navigation logic changes later.
    this.metaService.removeTag("name='robots'");
  }
}
