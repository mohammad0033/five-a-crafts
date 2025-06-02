import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Product} from '../../../../core/models/product';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {catchError, EMPTY, finalize, switchMap, tap, throwError} from 'rxjs';
import {
  CategoryCollectionComponent
} from '../../../../shared/components/category-collection/category-collection.component';
import {Category} from '../../../../core/models/category';
import {NgIf} from '@angular/common';
import {CategoriesService} from '../../../../core/services/categories.service';
import {FavoritesApiService} from '../../../../core/services/favorites-api.service';
import {ProductsService} from '../../../../core/services/products.service';

@UntilDestroy()
@Component({
  selector: 'app-our-collections',
  imports: [
    CategoryCollectionComponent,
    NgIf
  ],
  templateUrl: './our-collections.component.html',
  standalone: true,
  styleUrl: './our-collections.component.scss'
})
export class OurCollectionsComponent implements OnInit {
  category!: Category
  products : Product[] = []
  isLoading: boolean = false
  currentLang!: string

  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowRight = faArrowRight;

  constructor(private categoriesService: CategoriesService,
              private productsService: ProductsService,
              private favoritesApiService: FavoritesApiService,
              private translate: TranslateService) {}

  ngOnInit() {
    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
    })

    this.loadCollectionsData();
  }

  loadCollectionsData() {
    this.isLoading = true;
    this.categoriesService.getCategoriesData().pipe(
      untilDestroyed(this),
      tap(categories => {
        console.log('All Categories fetched:', categories);
        if (categories && categories.length > 0) {
          this.category = categories[0]; // Assign the first category
          console.log('Selected first category:', this.category);
        } else {
          console.warn("No categories found.");
          // Set category to undefined or throw an error to prevent further processing
          this.category = undefined!; // Explicitly set to undefined if no categories
          // The exclamation mark is to satisfy strict null checks if category is expected to be set.
          // Consider throwing an error if a category is essential.
          // throw new Error("No categories available to display.");
        }
      }),
      // Use switchMap to switch to the products observable *after* categories are processed
      switchMap(() => {
        // Only fetch products if the category was found
        if (this.category) {
          return this.productsService.getCategoryProducts(this.category.id.toString()); // Convert to string();
        } else {
          // If category wasn't found, return an empty observable or handle error
          return EMPTY; // Or return throwError(() => new Error('Category not available'));
        }
      }),
      // finalize will run when the *entire* chain completes or errors
      finalize(() => {
        this.isLoading = false;
        console.log('Finished loading collections data.');
      }),
      // Catch errors from *either* API call
      catchError(err => {
        console.error('Error loading collections data:', err);
        this.products = []; // Clear products on error
        // Optionally, you could set an error message property to display in the template
        return throwError(() => err); // Re-throw the error or return EMPTY/of([])
      })
    ).subscribe({
      next: (productsData) => {
        this.products = productsData;
        console.log('Candles Collection products loaded:', this.products);
      },
      // Error handling is now primarily done in the catchError operator
      // error: (err) => {} // This block is less necessary now but can be kept for specific final error actions
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
