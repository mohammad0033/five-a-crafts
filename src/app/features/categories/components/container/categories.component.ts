import {Component, OnInit} from '@angular/core';
import {PageMetadata} from '../../../../core/models/page-meta-data';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {CategoriesRowComponent} from '../../../../shared/components/categories-row/categories-row.component';
import {
  CategoriesSplidesComponent
} from '../../../../shared/components/categories-splides/categories-splides.component';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {NgForOf, NgIf} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {CategoriesService} from '../../services/categories.service';
import {Category} from '../../../../core/models/category';
import {CategoryCollectionComponent} from '../category-collection/category-collection.component';
import {Product} from '../../../../core/models/product';
import {catchError, EMPTY, finalize, switchMap, tap, throwError} from 'rxjs';
import {ProductsApiService} from '../../../../core/services/products-api.service';

@UntilDestroy()
@Component({
  selector: 'app-categories',
  imports: [
    TranslatePipe,
    CategoriesRowComponent,
    CategoriesSplidesComponent,
    FaIconComponent,
    NgForOf,
    NgIf,
    RouterLink,
    CategoryCollectionComponent
  ],
  templateUrl: './categories.component.html',
  standalone: true,
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories:Category[] = [];
  categoryRows:any[] = [];
  products : Product[] = []
  isLoading: boolean = false
  currentLang!: string

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
              private productsApiService: ProductsApiService,
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
      tap(categories => {
        this.categories = categories;
      }),
      // Use switchMap to switch to the products observable *after* categories are processed
      switchMap(() => {
        // Only fetch products if the category was found
        if (this.categories) {
          return this.productsApiService.getCandlesCollectionProducts();
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

  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowRight = faArrowRight;
}
