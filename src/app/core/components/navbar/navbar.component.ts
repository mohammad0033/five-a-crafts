import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {AsyncPipe, isPlatformBrowser, NgClass, NgForOf, NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faArrowRight, faSearch, faShoppingBag} from '@fortawesome/free-solid-svg-icons';
import {faHeart, faUser} from '@fortawesome/free-regular-svg-icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {BreakpointObserver} from "@angular/cdk/layout";
import {map, Observable, of} from "rxjs";
import {NgbDropdown, NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';
import {CartService} from '../../services/cart.service';
import {FavoritesApiService} from '../../services/favorites-api.service';
import {Category} from '../../models/category';
import {CategoriesService} from '../../services/categories.service';
import {SearchComponent} from '../search/search.component';
import {ProductsService} from '../../services/products.service';
import {Product} from '../../models/product';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  imports: [
    FaIconComponent,
    TranslatePipe,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgForOf,
    NgbDropdownModule,
    NgClass,
    AsyncPipe,
    SearchComponent,
  ],
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrl: './navbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush // Good practice with async pipes/observables
})
export class NavbarComponent implements OnInit{
  @ViewChild('categoriesDropdown') categoriesDropdown!: NgbDropdown;
  @ViewChild(SearchComponent) searchComponentInstance?: SearchComponent;
  protected readonly faUser = faUser;
  protected readonly faSearch = faSearch;
  protected readonly faHeart = faHeart;
  protected readonly faShoppingBag = faShoppingBag;
  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft; // Added missing declaration
  // Screen size tracking
  isDesktop: boolean = false;
  private readonly desktopBreakpoint = '(min-width: 768px)';
  // Property to hold the mega menu data
  // megaMenuColumns: MegaMenuData | null = null;

  // Property to hold categories for the simple dropdown
  categories$: Observable<Category[]> | undefined; // Use Observable for categories
  currentLang!: string;
  cartItemsCount: number = 0;
  favoritesCount: number = 0;
  currentSearchQuery: string = '';
  productsToDisplay$: Observable<Product[]> = of([]);
  totalProducts = 0;
  isLoadingSearchResults: boolean = false;

  isSearchVisible = false;
    constructor(
        private breakpointObserver: BreakpointObserver,
        @Inject(PLATFORM_ID) private platformId: Object,
        private cdRef: ChangeDetectorRef,
        private categoriesService: CategoriesService,
        private productsService: ProductsService,
        private router: Router,
        private translate: TranslateService,
        private favoritesApiService: FavoritesApiService,
        private cartService: CartService) {}

    ngOnInit(): void {
      this.trackScreenSize();
      // this.loadMegaMenuData();
      this.loadCategories(); // Call to load categories

      this.currentLang = this.translate.currentLang

      this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event) => {
        this.currentLang = event.lang
      })

      // Load initial favorites and subscribe to count updates
      this.favoritesApiService.loadFavorites(); // <-- Trigger initial load of favorites
      this.favoritesApiService.favoritesCount$
        .pipe(untilDestroyed(this))
        .subscribe(count => {
          this.favoritesCount = count;
          this.cdRef.markForCheck(); // Trigger change detection for OnPush
        });

      //load cart items count
      this.cartService.itemCount$.pipe(untilDestroyed(this)).subscribe(count => {
        this.cartItemsCount = count;
        this.cdRef.markForCheck(); // Trigger change detection for OnPush
      });
    }

  private trackScreenSize(): void {
    // Only run BreakpointObserver in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.breakpointObserver
        .observe([this.desktopBreakpoint])
        .pipe(
          map(result => result.matches), // Get the boolean value directly
          untilDestroyed(this) // Auto-unsubscribe when component is destroyed
        )
        .subscribe(matches => {
          this.isDesktop = matches;
          this.cdRef.markForCheck(); // Trigger change detection for OnPush
        });
    } else {
      // Default server-side behavior (or handle differently if needed)
      this.isDesktop = false; // Or true, depending on desired SSR default
    }
  }

  // Method to load categories
  private loadCategories(): void {
    this.categories$ = this.categoriesService.getCategoriesData()
      .pipe(
        untilDestroyed(this) // Auto-unsubscribe when component is destroyed
        // No need to call markForCheck here, async pipe will handle it
      );
  }

  // private loadMegaMenuData(): void {
  //   this.contentService.getMegaMenuData()
  //     .pipe(
  //       untilDestroyed(this) // Auto-unsubscribe when component is destroyed
  //     )
  //     .subscribe({
  //       next: (data) => {
  //         this.megaMenuColumns = data;
  //         this.cdRef.markForCheck(); // Trigger change detection for OnPush
  //       },
  //       error: (error) => {
  //         console.error('Error loading mega menu data:', error);
  //       }
  //     });
  // }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    console.log(lang);
  }

  // Method to close the dropdown on click (for desktop)
  closeDropdownOnDesktopClick(): void {
    if (this.isDesktop && this.categoriesDropdown) {
      console.log('Closing dropdown on desktop click');
      this.categoriesDropdown.close();
    }
    // Navigation is handled by routerLink directive on the anchor tag
  }

  isCategoriesOrProductsLinkActive(): boolean {
    // This configuration mimics routerLinkActiveOptions="{ exact: false }"
    // It checks if the current URL path starts with '/categories' or '/products'.
    const isActiveOptions = {
      paths: 'subset',        // Match if the URL is a subset (e.g., /categories/electronics)
      queryParams: 'ignored', // Ignore query parameters
      fragment: 'ignored',    // Ignore URL fragments
      matrixParams: 'ignored' // Ignore matrix parameters
    } as const; // Use 'as const' for stricter type checking on the options object

    return this.router.isActive('/categories', isActiveOptions) ||
      this.router.isActive('/products', isActiveOptions) ||
      this.router.isActive('/category', isActiveOptions);
  }

  // Method to open the cart
  openCart(): void {
    this.cartService.openDrawer();
  }

  // Method to toggle search input visibility
  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    if (!this.isSearchVisible) {
      // If hiding search, clear query, results, and the input in SearchComponent
      this.currentSearchQuery = '';
      this.productsToDisplay$ = of([]);
      this.totalProducts = 0;
      this.isLoadingSearchResults = false;
      if (this.searchComponentInstance && this.searchComponentInstance.searchControl.value) {
        this.searchComponentInstance.clearSearch(); // This will also trigger (search) event with ""
      }
    }
    this.cdRef.markForCheck();
  }

  handleSearch(query: string): void {
    const trimmedQuery = query.trim();
    // Update currentSearchQuery immediately for UI responsiveness (e.g. showing "No results for '...'"")
    this.currentSearchQuery = trimmedQuery;

    if (!trimmedQuery) {
      // Query is empty (cleared search)
      this.productsToDisplay$ = of([]);
      this.totalProducts = 0;
      this.isLoadingSearchResults = false;
      this.cdRef.markForCheck();
      return; // Do not fetch
    }

    // The SearchComponent already filters for query.length >= 3 or query.length === 0.
    // So, if trimmedQuery is not empty here, it's a valid search term.
    this.fetchProducts();
  }

  fetchProducts(): void {
    // Double-check, though handleSearch should prevent this
    if (!this.currentSearchQuery) {
      this.productsToDisplay$ = of([]);
      this.isLoadingSearchResults = false;
      this.cdRef.markForCheck();
      return;
    }

    this.isLoadingSearchResults = true;
    this.productsToDisplay$ = of([]); // Clear previous results while loading new ones
    this.cdRef.markForCheck();

    // console.log('Fetching products with query:', this.currentSearchQuery);

    this.productsService.getProducts(
      1,
      10, // Page size for dropdown, adjust as needed
      undefined, // categories
      undefined, // colors
      this.currentSearchQuery, // search query
      undefined  // sort
    ).pipe(
      untilDestroyed(this)
    ).subscribe({
      next: (response) => {
        this.productsToDisplay$ = of(response.products);
        this.totalProducts = response.totalCount;
        this.isLoadingSearchResults = false;
        // console.log('Products fetched:', response.products.length, 'Total:', response.totalCount);
        this.cdRef.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.productsToDisplay$ = of([]);
        this.totalProducts = 0;
        this.isLoadingSearchResults = false;
        this.cdRef.markForCheck();
      }
    });
  }
}
