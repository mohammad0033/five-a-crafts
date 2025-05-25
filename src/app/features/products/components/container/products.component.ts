import {Component, OnInit, ViewChild} from '@angular/core';
import {SearchWidgetComponent} from '../search-widget/search-widget.component';
import {CategoriesWidgetComponent} from '../categories-widget/categories-widget.component';
import {ColorsWidgetComponent} from '../colors-widget/colors-widget.component';
import {map, Observable, of, shareReplay} from 'rxjs';
import {Category} from '../../../../core/models/category';
import {CategoriesService} from '../../../../core/services/categories.service';
import {AsyncPipe, NgClass, NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';
import {ProductsService} from '../../../../core/services/products.service';
import {Color} from '../../../../core/models/color';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {ActivatedRoute} from '@angular/router';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {PageMetadata} from '../../../../core/models/page-meta-data';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginator, MatPaginatorIntl, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {CustomPaginatorIntl} from '../../services/custom-paginator-intl.service';
import {Product} from '../../../../core/models/product';
import {ProductCardComponent} from '../../../../shared/components/product-card/product-card.component';
import {FavoritesApiService} from '../../../../core/services/favorites-api.service';
import {MatDividerModule} from '@angular/material/divider';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

// Define your sort options (you can make this more complex with display names if needed)
export enum SortOption {
  NONE = '', // Default or no sort
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc'
}

export interface SortOptionDisplay {
  value: SortOption;
  baseTranslationKey: string; // e.g., 'products.sort.price'
  directionIcon?: 'arrow_upward' | 'arrow_downward'; // Material icon name for direction
}

@UntilDestroy()
@Component({
  selector: 'app-products',
  imports: [
    SearchWidgetComponent,
    CategoriesWidgetComponent,
    ColorsWidgetComponent,
    AsyncPipe,
    TranslatePipe,
    NgIf,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    NgClass,
    NgForOf,
    MatPaginatorModule,
    ProductCardComponent,
    MatSidenavModule, // Add MatSidenavModule
    MatDividerModule,
    NgTemplateOutlet,
    // Add MatDividerModule
  ],
  providers: [{provide: MatPaginatorIntl, useClass: CustomPaginatorIntl}],
  templateUrl: './products.component.html',
  standalone: true,
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit{
  // Get references to the child components
  @ViewChild(CategoriesWidgetComponent) categoriesWidget!: CategoriesWidgetComponent;
  @ViewChild(ColorsWidgetComponent) colorsWidget!: ColorsWidgetComponent;
  @ViewChild(SearchWidgetComponent) searchWidget!: SearchWidgetComponent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('filterDrawer') filterDrawer!: MatDrawer; // ViewChild for the drawer

  isSmallScreen$: Observable<boolean>;

  filterableCategories$: Observable<Category[]> = of([]);
  filterableColors$: Observable<Color[]> = of([]);
  productsToDisplay$: Observable<Product[]> = of([]); // To hold products for the template
  selectedCategories: number[] = [];
  selectedColors: string[] = [];
  currentSearchQuery: string = '';
  currentLang!: string;
  isLoadingProducts = false; // For loading indicator

  // --- Sort State ---
  currentSortOption: SortOption = SortOption.NONE; // Default sort option

  // Updated sortOptions array
  sortOptions: SortOptionDisplay[] = [
    { value: SortOption.PRICE_ASC, baseTranslationKey: 'products.price', directionIcon: 'arrow_upward' },
    { value: SortOption.PRICE_DESC, baseTranslationKey: 'products.price', directionIcon: 'arrow_downward' },
    { value: SortOption.NAME_ASC, baseTranslationKey: 'products.name', directionIcon: 'arrow_upward' },
    { value: SortOption.NAME_DESC, baseTranslationKey: 'products.name', directionIcon: 'arrow_downward' },
  ];

  // --- Pagination State ---
  totalProducts = 0; // Total number of products matching filters
  pageSize = 12; // Number of products per page
  currentPageIndex = 0; // Current page index (0-based)
  pageSizeOptions: number[] = [6, 12, 24, 48]; // Options for page size

  // --- Fallback Metadata Content for Products Page ---
  private readonly fallbackData: FallbackMetaTagData = {
    title: 'All Products | Five A Crafts', // Example title
    description: 'Browse all available products at Five A Crafts. Find handmade candles, unique gifts, home decor, and more.', // Example description
    // --- Replace placeholders with your actual URLs ---
    ogImageUrl: 'https://www.yourdomain.com/assets/og-image-products.jpg', // General OG image for products
    twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image-products.jpg' // General Twitter image for products
  };
  // --- Page Specific Data ---
  private readonly canonicalUrl = 'https://www.yourdomain.com/products'; // Replace with your actual domain/path for the products page
  private readonly twitterHandle = '@YourTwitterHandle'; // Replace (optional)
  // --- End of Placeholders ---

  constructor(private categoriesService: CategoriesService,
              private productsService: ProductsService,
              private metaTagService: MetaTagService,
              private favoritesApiService: FavoritesApiService,
              private translate: TranslateService,
              private route: ActivatedRoute,
              private breakpointObserver: BreakpointObserver) {
    this.isSmallScreen$ = this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).pipe(
      map(result => result.matches),
      shareReplay() // Cache the last emitted value
    );
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang;
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang;
      // Potentially re-set tags if metadata content depends on language
      // and is not handled by ngx-translate pipes directly in meta service
      // For now, we assume meta content is set once or handled by meta service internally
    });

    // Access resolved data (if your routing provides specific metadata for the /products route)
    // For a general products listing, this might be null or a generic PageMetadata object.
    const resolvedMetaData = this.route.snapshot.data['metaData'] as PageMetadata | null;

    // Call the service to set tags for the Products page
    this.metaTagService.setTags(
      resolvedMetaData,
      this.fallbackData, // Use the Products page's specific fallbacks
      {
        canonicalUrl: this.canonicalUrl, // Use the Products page's canonical URL
        ogType: 'website', // A general products listing page is often 'website' or 'object'
        twitterHandle: this.twitterHandle
      }
    );

    this.loadInitialData();
  }

  loadInitialData(): void {
    this.filterableCategories$ = this.categoriesService.getCategoriesData();
    this.filterableColors$ = this.productsService.getFilterableColors();
    this.fetchProducts(); // Initial product fetch
  }

  fetchProducts(): void {
    this.isLoadingProducts = true;
    const pageNum = this.currentPageIndex + 1; // API usually expects 1-based page index

    console.log('Fetching products with:', {
      search: this.currentSearchQuery || undefined,
      categories: this.selectedCategories.length > 0 ? this.selectedCategories : undefined,
      colors: this.selectedColors.length > 0 ? this.selectedColors : undefined,
      sort: this.currentSortOption !== SortOption.NONE ? this.currentSortOption : undefined,
      page: pageNum,
      pageSize: this.pageSize
    });

    this.productsService.getProducts(
      pageNum,
      this.pageSize,
      this.selectedCategories.length > 0 ? this.selectedCategories : undefined,
      this.selectedColors.length > 0 ? this.selectedColors : undefined,
      this.currentSearchQuery || undefined,
      this.currentSortOption !== SortOption.NONE ? this.currentSortOption : undefined
    ).pipe(
      untilDestroyed(this)
    ).subscribe({
      next: (response) => {
        this.productsToDisplay$ = of(response.products);
        this.totalProducts = response.totalCount;
        this.isLoadingProducts = false;
        console.log('Products fetched. Displaying:', response.products.length, 'Total on server:', response.totalCount);
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.productsToDisplay$ = of([]);
        this.totalProducts = 0;
        this.isLoadingProducts = false;
      }
    });
  }

  private resetPaginationAndFetch(): void {
    this.currentPageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0; // Reset paginator view
    }
    this.fetchProducts();
  }

  handleSearch(query: string): void {
    this.currentSearchQuery = query;
    this.resetPaginationAndFetch();
  }

  // Method to handle category selection changes from the widget
  handleCategorySelection(selectedCategories: number[]): void {
    console.log('Selected categories received in parent:', selectedCategories);
    this.selectedCategories = selectedCategories;
    // Now you can use the 'selectedCategories' array to filter products
    // (e.g., call a service to fetch products based on selected categories)
  }

  // Method to handle color selection changes from the widget
  onColorSelectionChanged(selectedColors: string[]): void {
    console.log('Selected colors received in parent:', selectedColors);
    this.selectedColors = selectedColors;
    // Now you can use the 'selectedColors' array to filter products
    // (e.g., call a service to fetch products based on selected colors)
  }

  // Updated to work with MatDrawer
  applyFiltersAndCloseDrawer(isDrawer: boolean | null, drawer: MatDrawer) {
    this.resetPaginationAndFetch();
    if (isDrawer) {
      drawer.close();
    }
  }

  // Updated to work with MatDrawer
  clearFiltersAndCloseDrawer(isDrawer: boolean | null, drawer: MatDrawer) {
    this.selectedCategories = [];
    this.selectedColors = [];
    this.currentSearchQuery = '';
    this.currentSortOption = SortOption.NONE;

    if (this.categoriesWidget) this.categoriesWidget.clearSelection();
    if (this.colorsWidget) this.colorsWidget.clearSelection();
    if (this.searchWidget) this.searchWidget.clearSearch();

    this.resetPaginationAndFetch();
    if (isDrawer) {
      drawer.close();
    }
    console.log('Filters cleared');
  }

  setSortOption(option: SortOption): void {
    this.currentSortOption = option;
    this.resetPaginationAndFetch();
  }

  // Helper to get the display object for the current sort option
  getCurrentSortOptionDisplay(): SortOptionDisplay | undefined {
    return this.sortOptions.find(opt => opt.value === this.currentSortOption);
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPageIndex = event.pageIndex;
    this.fetchProducts();
  }

  handleFavoriteToggle(productToToggle: Product): void {
    console.log(`Component: Toggling favorite for ${productToToggle.title}`);
    this.favoritesApiService.toggleFavorite(productToToggle.id)
      .pipe(untilDestroyed(this)) // Component subscribes to the toggle action
      .subscribe({
        next: (result) => {
          if (result.action === 'added' && result.product) {
            console.log(`${result.product.title} was added to favorites. List will refresh via service.`);
          } else if (result.action === 'removed') {
            // Using productToToggle.title here as the removed product object isn't always returned by remove ops
            console.log(`${productToToggle.title} (ID: ${result.productId}) was removed from favorites. List will refresh via service.`);
          }
          // The favorites list (products$) will update automatically because
          // toggleFavorite calls addFavorite/removeFavorite, which in turn call loadFavorites.
        },
        error: (err) => console.error(`Component: Failed to toggle favorite for ${productToToggle.title}`, err)
      });
  }
}
