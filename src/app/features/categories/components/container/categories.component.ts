import {Component, OnInit} from '@angular/core';
import {PageMetadata} from '../../../../core/models/page-meta-data';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {ActivatedRoute} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {CategoriesRowComponent} from '../../../../shared/components/categories-row/categories-row.component';
import {
  CategoriesSplidesComponent
} from '../../../../shared/components/categories-splides/categories-splides.component';
import {NgForOf, NgIf} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {CategoriesService} from '../../../../core/services/categories.service';
import {CategoryCollectionComponent} from '../../../../shared/components/category-collection/category-collection.component';
import {Product} from '../../../../core/models/product';
import {catchError, finalize, forkJoin, map, of, switchMap, tap, throwError} from 'rxjs';
import {FavoritesApiService} from '../../../../core/services/favorites-api.service';
import {ProductsService} from '../../../../core/services/products.service';
import {CategoryWithProducts} from '../../../../core/models/category-with-products';

@UntilDestroy()
@Component({
  selector: 'app-categories',
  imports: [
    TranslatePipe,
    CategoriesRowComponent,
    CategoriesSplidesComponent,
    NgForOf,
    NgIf,
    CategoryCollectionComponent
  ],
  templateUrl: './categories.component.html',
  standalone: true,
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories:CategoryWithProducts[] = [];
  categoryRows:CategoryWithProducts[][] = [];
  isLoading: boolean = false
  currentLang!: string

  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowRight = faArrowRight;

  // --- Fallback Metadata Content for Categories Page ---
  private readonly fallbackData: FallbackMetaTagData = {
    title: 'Product Categories | Five A Crafts',
    description: 'Explore all product categories offered by Five A Crafts, including handmade candles, unique gifts, home decor, and essential craft supplies.',
    // --- Replace placeholders ---
    ogImageUrl: 'https://www.yourdomain.com/assets/og-image-categories.jpg', // Use a relevant default OG image
    twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image-categories.jpg' // Use a relevant default Twitter image
  };
  // --- Page Specific Data ---
  private readonly canonicalUrl = 'https://www.yourdomain.com/categories'; // Replace with your actual domain/path
  private readonly twitterHandle = '@YourTwitterHandle'; // Replace (optional)
  // --- End of Placeholders ---


  constructor(private metaTagService: MetaTagService,
              private categoriesService: CategoriesService,
              private productsService: ProductsService,
              private favoritesApiService: FavoritesApiService,
              private translate: TranslateService,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
    })

    // Access the resolved data (key 'metaData' must match routing)
    const resolvedMetaData = this.route.snapshot.data['metaData'] as PageMetadata | null;

    // Call the service to set tags for the Categories page
    this.metaTagService.setTags(
      resolvedMetaData,
      this.fallbackData, // Use the Categories page's specific fallbacks
      {
        canonicalUrl: this.canonicalUrl, // Use the Categories page's canonical URL
        ogType: 'website', // Or 'object' depending on how you view a category listing
        twitterHandle: this.twitterHandle
      }
    );

    this.loadCollectionsData();
  }

  loadCollectionsData() {
    this.isLoading = true;
    this.categoriesService.getCategoriesData().pipe(
      untilDestroyed(this),
      tap(fetchedCategories => {
        console.log('Categories loaded:', fetchedCategories);
        this.categories = fetchedCategories.map(cat => ({
          ...cat,
          products: [],
          isLoadingProducts: true // To show loading per category collection if desired
        }));
        // Split the data into chunks of 2
        this.categoryRows = []; // Reset the rows array
        for (let i = 0; i < this.categories.length; i += 2) {
          this.categoryRows.push(this.categories.slice(i, i + 2));
        }
      }),
      // Use switchMap to switch to the products observable *after* categories are processed
      switchMap(initialCategories => { // initialCategories are the raw categories from categoriesService
        if (!initialCategories || initialCategories.length === 0) {
          // No categories, return an observable that emits an empty array
          // to satisfy forkJoin's expected input.
          return of([]);
        }
        // Create an array of Observables, one for each category's products
        const productObservables = initialCategories.map(category =>
          this.productsService.getCategoryProducts(category.id.toString()).pipe(
            map(products => ({ categoryId: category.id, products })), // Map to include categoryId for matching
            catchError(err => {
              console.error(`Error loading products for category ${category.name} (ID: ${category.id}):`, err);
              // Return an observable with empty products for this category on error,
              // so forkJoin doesn't fail completely.
              return of({ categoryId: category.id, products: [] as Product[] });
            })
          )
        );
        // forkJoin will wait for all productObservables to complete
        return forkJoin(productObservables);
      }),
      // The result of forkJoin (categoryProductResults) is an array of { categoryId: string, products: Product[] }
      tap(categoryProductResults => {
        // Assign fetched products to their respective categories
        this.categories.forEach(category => {
          const result = categoryProductResults.find(r => r.categoryId === category.id);
          if (result) {
            category.products = result.products;
          }
          category.isLoadingProducts = false; // Update loading state for this category
          console.log(`Products for category ${category.name} (ID: ${category.id}):`, category.products);
        });
      }),
      // finalize will run when the *entire* chain completes or errors
      finalize(() => {
        this.isLoading = false;
        console.log('Finished loading collections data.');
      }),
      // Catch errors from *either* API call
      catchError(err => {
        console.error('Error in the categories/products loading pipeline:', err);
        // Ensure all individual loading states are false and products are cleared on a major error
        this.categories.forEach(category => {
          category.isLoadingProducts = false;
          category.products = [];
        });
        return throwError(() => err); // Re-throw the error
      })
    ).subscribe({
      next: () => {
        // This 'next' callback receives the array of results from forkJoin.
        // The main processing of assigning products to categories is done in the `tap` operator above.
        console.log('All category product fetch operations completed and results processed.');
      },
      error: (err) => {
        // This error callback is for errors that might slip through the main catchError
        // or are re-thrown by it.
        console.error('Subscription error after pipeline processing:', err);
      }
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
