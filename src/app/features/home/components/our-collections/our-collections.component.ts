import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Product} from '../../../../core/models/product';
import {ProductsApiService} from '../../../../core/services/products-api.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {catchError, EMPTY, finalize, switchMap, tap, throwError} from 'rxjs';
import {
  CategoryCollectionComponent
} from '../../../categories/components/category-collection/category-collection.component';
import {Category} from '../../../../core/models/category';
import {NgIf} from '@angular/common';
import {CategoriesService} from '../../../categories/services/categories.service';

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

  constructor(private categoriesService: CategoriesService,
              private productsApiService: ProductsApiService,
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
        // Find the 'Candles' category (adjust 'Candles' if the name might differ)
        const candlesCategory = categories.find(cat => cat.name === 'Candles');
        if (candlesCategory) {
          this.category = candlesCategory;
          console.log('Found Candles category:', this.category);
        } else {
          console.warn("Could not find 'Candles' category.");
          // Optionally handle the case where the category isn't found
          // Maybe throw an error or assign a default/empty category
          throw new Error("Candles category not found"); // Or handle differently
        }
      }),
      // Use switchMap to switch to the products observable *after* categories are processed
      switchMap(() => {
        // Only fetch products if the category was found
        if (this.category) {
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
