import {
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import {ProductDetailsData} from '../../models/product-details-data';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {AsyncPipe, DatePipe, DecimalPipe, isPlatformBrowser, NgClass, NgForOf, NgIf} from '@angular/common';
import {LightboxModule} from 'ng-gallery/lightbox';
import {GalleryComponent, GalleryItem, GalleryModule, ImageItem} from 'ng-gallery';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import {faHeart as faHeartSolid, faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import { BidiModule, Direction } from '@angular/cdk/bidi';
import {NgbRating} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ReviewsData} from '../../models/reviews-data';
import {Review} from '../../models/review';
import {ProductsApiService} from '../../../../core/services/products-api.service';
import {Observable, of, timer} from 'rxjs';
import {Product} from '../../../../core/models/product';
import {ProductsSliderComponent} from '../../../../shared/components/products-slider/products-slider.component';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarModule} from '@angular/material/snack-bar';
import {CartService} from '../../../../core/services/cart.service';
import {Url} from '../../../../core/constants/base-url';
import {SelectedVariation} from '../../../cart/models/selected-variation';
import {RecentlyViewedService} from '../../../../core/services/recently-viewed.service';
import {ProductImageData} from '../../models/product-image-data';
import {ProductsService} from '../../../../core/services/products.service';
import {FavoritesApiService} from '../../../../core/services/favorites-api.service';
import {FavoritesToggleResult} from '../../../favorites/models/favorites-toggle-result';

@UntilDestroy()
@Component({
  selector: 'app-product-details',
  imports: [
    LightboxModule,
    GalleryModule,
    FaIconComponent,
    NgIf,
    NgClass,
    TranslatePipe,
    GalleryComponent,
    RouterLink,
    BidiModule,
    NgbRating,
    NgForOf,
    FormsModule,
    DecimalPipe,
    AsyncPipe,
    ProductsSliderComponent,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  templateUrl: './product-details.component.html',
  standalone: true,
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  @Output() favoriteToggled: EventEmitter<ProductDetailsData> = new EventEmitter<ProductDetailsData>();
  productsYouMayLike$!: Observable<Product[]>;
  recentlyViewedProducts$!: Observable<Product[]>;

  protected readonly faHeartRegular = faHeartRegular;
  protected readonly faHeartSolid = faHeartSolid;
  protected readonly faPlus = faPlus;
  protected readonly faMinus = faMinus;

  product: ProductDetailsData | null = null;
  images: GalleryItem[] = [];
  isLoading: boolean = true;
  errorLoading: boolean = false;
  isBrowser = false;
  isAnimating = false;
  productQty = 1;
  productStock : number | undefined = 0
  currentLang!: string
  dir: Direction = 'ltr';
  galleryThumbs  = true;
  galleryThumbPosition = 'bottom' as "bottom";
  galleryThumbCentralized = false;
  galleryImageSize = 'cover' as "cover";
  galleryDisableThumbMouseScroll = false;

  // meta data fallback data
  private readonly fallbackMetaData: FallbackMetaTagData = {
    title: 'Product Details | Five A Crafts',
    description: 'Explore detailed information about our handcrafted and sustainable products available at Five A Crafts.',
    ogImageUrl: 'https://www.yourdomain.com/assets/og-image-default-product.jpg',
    twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image-default-product.jpg'
  };
  private readonly twitterHandle = '@YourTwitterHandle';

  variationsForm!: FormGroup;

  // --- Reviews Section Data (Mock data, replace with actual data source) ---
  public reviewsData: ReviewsData | null = null; // Your existing reviews summary data
  public maxRating: number = 5;

  // --- Review Form ---
  reviewForm!: FormGroup;
  isSubmittingReview: boolean = false;

  // --- New/Modified properties for review pagination ---
  private allProductReviews: Review[] = []; // Holds ALL reviews for the product
  public visibleReviews: Review[] = [];    // Reviews currently displayed (already in your HTML)
  public canShowMore: boolean = false;     // Controls visibility of "Show More" button (already in your HTML)
  private readonly reviewsIncrement: number = 5; // Number of reviews to show per click
  private numReviewsCurrentlyVisible: number = 0; // Counter for visible reviews

  private snackBarConfig: MatSnackBarConfig = {
    duration: 3000, // Default duration in ms
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  constructor(
    private metaTagService: MetaTagService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private productsApiService: ProductsApiService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private cartService: CartService,
    private favoritesApiService: FavoritesApiService, // Inject FavoritesService
    private recentlyViewedService: RecentlyViewedService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.variationsForm = this.fb.group({}); // Initialize an empty group
  }

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang;
    // explicitly set direction
    if (this.currentLang === 'ar') {
      this.dir = 'rtl';
    } else {
      this.dir = 'ltr';
    }
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang;
      this.toggleDir();
    });

    this.initReviewForm(); // Initialize the review form

    // Product data from resolver
    const resolvedProduct = this.route.snapshot.data['productData'] as ProductDetailsData | null;
    console.log('Product data from resolver:', resolvedProduct);
    this.isLoading = true; // Start with loading true

    if (resolvedProduct) {
      this.product = resolvedProduct;
      this.initializeVariationsForm(); // Call this after product is set
      this.errorLoading = false;
      // Meta tags, images, stock setup
      const canonicalUrl = `${Url.baseUrl}/api/oscar/products/${this.product.id}`;
      this.metaTagService.setTags(
        this.product.metaData, this.fallbackMetaData,
        { canonicalUrl, ogType: 'product', twitterHandle: this.twitterHandle }
      );
      this.productStock = this.product.stock;
      this.images = Array.isArray(this.product.images)
        ? this.product.images.map(item => new ImageItem({ src: item.original, thumb: item.original }))
        : [];

      // --- START: Sync favorite status on init ---
      if (this.product && this.product.id != null) {
        this.favoritesApiService.isFavorite(this.product.id)
          .pipe(untilDestroyed(this))
          .subscribe(isFav => {
            if (this.product) { // Check again as product might change if navigation happens quickly
              this.product.in_wishlist = isFav;
              console.log(`ProductDetailsComponent: Initial favorite status for ${this.product.title} set to ${isFav}`);
            }
          });
      }
      // --- END: Sync favorite status on init ---

      // Add to recently viewed (client-side only)
      if (this.isBrowser && this.product) {
        // Map ProductDetailsData to the Product model structure expected by RecentlyViewedService and ProductCardComponent
        const productForRecentlyViewed: Product = {
          id: this.product.id, // Ensure ProductDetailsData has 'id'
          slug: this.product.slug,
          title: this.product.title,
          description: this.product.description,
          price: this.product.price, // If Product.price is a number: this.product.price?.incl_tax
                                     // If Product.price is an object, ensure compatibility
          images: this.product.images?.map((img: ProductImageData) => ({
            id: img.id,
            code: img.code,
            original: img.original,
            caption: img.caption,
            display_order: img.display_order,
            date_created: img.date_created
          })),
          product_class: this.product.product_class,
          stock: this.product.stock,
          in_wishlist: this.product.in_wishlist, // Optional: if your ProductCard shows wishlist status
          // Add other fields if your Product model requires them and ProductDetailsData provides them
        };
        this.recentlyViewedService.addProduct(productForRecentlyViewed);
      }

      // Fetch reviews for this product
      this.loadProductReviews(this.product.id);
      // isLoading will be set to false after reviews are also loaded or fail

      // MODIFICATION: Get "You May Like" products from recommended_products
      if (this.product.recommended_products && this.product.recommended_products.length > 0) {
        // Assuming items in recommended_products are compatible with the Product type
        this.productsYouMayLike$ = of(this.product.recommended_products as Product[]);
      } else {
        // If no recommended_products, or array is empty, provide an empty observable
        this.productsYouMayLike$ = of([]);
      }
      // END MODIFICATION

    } else {
      this.product = null;
      this.isLoading = false; // Finished loading attempt (failed)
      this.errorLoading = true;
      console.error('Failed to load product details from resolver.');
      const canonicalUrl = `https://fivecraft-front.beelogico.com//`;
      this.router.navigate(['/not-found']); // Or your preferred 404 route
      this.metaTagService.setTags(null, this.fallbackMetaData, { canonicalUrl, ogType: 'website', twitterHandle: this.twitterHandle });
    }

    // get recently viewed
    this.recentlyViewedProducts$ = this.recentlyViewedService.getRecentlyViewedProducts();
  }

  private initializeVariationsForm(): void {
    if (this.product && this.product.product_options) {
      const groupConfig: { [key: string]: any } = {};
      this.product.product_options.forEach(optionType => {
        // Map get_choices to options with name and value
        const options = optionType.get_choices.map((choice: string[]) => ({
          name: choice[1], // Assuming the second element is the display name
          value: choice[0]  // Assuming the first element is the value to submit
        }));

        // Set initial value: either pre-selected from backend (if available in your real data), or first option, or null
        const initialValue = options.length > 0 ? options[0].value : null;

        groupConfig[String(optionType.id)] = [initialValue, Validators.required]; // Make each variation required

        // Add options to the optionType for use in the template
        optionType.options = options;
      });
      this.variationsForm = this.fb.group(groupConfig);
      this.variationsForm.valueChanges.pipe(untilDestroyed(this)).subscribe(values => {
        this.product?.product_options?.forEach(cat => {
          // Find the selected option based on the form value
          const selectedOption = cat.options.find((opt: { value: any; }) => opt.value === values[String(cat.id)]);
          cat.selectedValue = selectedOption ? selectedOption.value : null;
        });
        console.log('Variation Form Values:', values);
      });
    }
  }

  onVariationChange(categoryName: string, optionName: string, optionValue: any) {
    console.log(`Selected variation: Category: ${categoryName}, Option: ${optionName}, Value: ${optionValue}`);
  }

  private initReviewForm(): void {
    this.reviewForm = this.fb.group({
      // productId: [null], // We'll add productId directly from this.product.id when submitting
      rating: [0, [Validators.required, Validators.min(1), Validators.max(this.maxRating)]],
      comment: ['', [Validators.required, Validators.minLength(5)]] // Added minLength for example
    });
  }

  private loadProductReviews(productId: number): void {
    this.productsService.getProductReviews(productId)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (reviewsData) => {
          // this.reviewsData = reviewsData;
          // this.allProductReviews = reviewsData.reviewsList || [];
          this.initializeReviewDisplay(this.allProductReviews);
          console.log('Product reviews loaded:', this.reviewsData);
          this.isLoading = false; // All product related data loaded
        },
        error: (err) => {
          console.error('Error loading product reviews:', err);
          this.reviewsData = { // Set to a default empty state to avoid errors in template
            totalReviews: 0, averageRating: 0, ratingDistribution: [], reviewsList: []
          };
          this.initializeReviewDisplay([]); // Initialize with empty to hide "show more" etc.
          this.isLoading = false; // Finished loading attempt (reviews failed)
        }
      });
  }

  // --- Review Pagination Methods (from your previous implementation) ---
  private initializeReviewDisplay(allReviews: Review[]): void {
    this.allProductReviews = allReviews || []; // Ensure allProductReviews is up-to-date
    this.visibleReviews = [];
    this.numReviewsCurrentlyVisible = 0;
    this.loadMoreReviewsLogic();
  }

  public showMoreReviews(): void { // This is called by the button in your HTML
    this.loadMoreReviewsLogic();
  }

  private loadMoreReviewsLogic(): void {
    if (!this.allProductReviews || this.numReviewsCurrentlyVisible >= this.allProductReviews.length) {
      this.updateCanShowMoreState();
      return;
    }
    const nextBatch = this.allProductReviews.slice(
      this.numReviewsCurrentlyVisible,
      this.numReviewsCurrentlyVisible + this.reviewsIncrement
    );
    this.visibleReviews.push(...nextBatch);
    this.numReviewsCurrentlyVisible += nextBatch.length;
    this.updateCanShowMoreState();
  }

  private updateCanShowMoreState(): void {
    this.canShowMore = this.allProductReviews && this.numReviewsCurrentlyVisible < this.allProductReviews.length;
  }

  submitReview(): void {
    this.reviewForm.markAllAsTouched(); // Show validation errors if any

    if (!this.product) {
      console.error('Product context is missing. Cannot submit review.');
      this.snackBar.open(this.translate.instant('product.productNotAvailableError'), this.translate.instant('common.dismiss'), {
        ...this.snackBarConfig, verticalPosition: 'top', panelClass: ['snackbar-error']
      });
      return;
    }

    if (this.reviewForm.invalid) {
      const validationMessage = this.translate.instant('product.reviews.validationError'); // Ensure this key exists
      this.snackBar.open(validationMessage, this.translate.instant('common.dismiss'), {
        ...this.snackBarConfig, verticalPosition: 'top', panelClass: ['snackbar-error']
      });
      return;
    }

    this.isSubmittingReview = true;
    this.reviewForm.disable(); // Disable the form during submission

    const formValue = this.reviewForm.value;
    const newReviewData: Review = {
      id: Date.now(), // Mock ID
      // productId: this.product.id, // Add product ID to the review data
      userName: 'Current User', // Replace with actual user data
      rating: formValue.rating,
      comment: formValue.comment.trim(),
      date: this.datePipe.transform(new Date(), 'dd/MM/yyyy') as string
    };

    console.log('Submitting review:', newReviewData);

    // Simulate API call delay
    timer(1500).pipe(untilDestroyed(this)).subscribe(() => {
      this.allProductReviews.unshift(newReviewData);

      if (this.reviewsData) {
        this.reviewsData.reviewsList = [...this.allProductReviews];
        this.reviewsData.totalReviews = this.allProductReviews.length;
        // Recalculate average and distribution
        let sumOfRatings = 0;
        const ratingDistributionMap = new Map<number, number>();
        for (let i = 5; i >= 1; i--) ratingDistributionMap.set(i, 0);
        this.allProductReviews.forEach(review => {
          sumOfRatings += review.rating;
          ratingDistributionMap.set(review.rating, (ratingDistributionMap.get(review.rating) || 0) + 1);
        });
        this.reviewsData.averageRating = this.allProductReviews.length > 0 ? parseFloat((sumOfRatings / this.allProductReviews.length).toFixed(1)) : 0;
        this.reviewsData.ratingDistribution = Array.from(ratingDistributionMap.entries())
          .map(([stars, count]) => ({ stars, count }))
          .sort((a, b) => b.stars - a.stars);
      } else {
        this.reviewsData = {
          totalReviews: 1, averageRating: newReviewData.rating,
          ratingDistribution: [{stars: newReviewData.rating, count: 1}],
          reviewsList: [newReviewData]
        };
      }

      this.initializeReviewDisplay(this.allProductReviews);
      this.reviewForm.reset({ rating: 0, comment: '' }); // Reset form to initial values
      this.reviewForm.enable(); // Re-enable the form
      this.isSubmittingReview = false;

      const successMessage = this.translate.instant('product.reviewSubmittedSuccessfully');
      this.snackBar.open(successMessage, this.translate.instant('common.dismiss'), {
        ...this.snackBarConfig, panelClass: ['snackbar-success']
      });
    });
  }

  // --- Getters for easy access to form controls in the template (optional but helpful for validation messages) ---
  get ratingCtrl() {
    return this.reviewForm.get('rating');
  }

  get commentCtrl() {
    return this.reviewForm.get('comment');
  }

  get categoryLink(): string | null {
    return this.product ? `/categories/${this.product.product_class}` : null;
  }

  handleFavoriteToggle(): void { // Removed productToToggle argument
    if (!this.product) {
      console.error('ProductDetailsComponent: Product data is not available to toggle favorite.');
      return;
    }

    // To ensure we are working with the current state of this.product
    const productToToggle = this.product;

    // Optimistic animation if adding to favorites
    if (!productToToggle.in_wishlist) {
      this.isAnimating = true;
      setTimeout(() => {
        this.isAnimating = false;
      }, 500); // Duration of heartbeat animation, adjust as needed
    }

    console.log(`ProductDetailsComponent: Toggling favorite for ${productToToggle.title}`);
    this.favoritesApiService.toggleFavoriteWithAuthPrompt(productToToggle.id)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (result: FavoritesToggleResult) => {
          // Update the local product's in_wishlist status for immediate UI feedback
          if (this.product) { // Check again in case product becomes null due to other async ops (unlikely here)
            if (result.action === 'added') {
              this.product.in_wishlist = true;
              console.log(`ProductDetailsComponent: ${this.product.title} was added to favorites.`);
            } else if (result.action === 'removed') {
              this.product.in_wishlist = false;
              console.log(`ProductDetailsComponent: ${this.product.title} (ID: ${result.productId}) was removed from favorites.`);
            }
          }
        },
        error: (err) => {
          console.error(`ProductDetailsComponent: Failed to toggle favorite for ${productToToggle?.title}`, err);
          // Stop animation on error if it was started
          this.isAnimating = false;
        }
      });
  }

  toggleDir() {
    this.dir = this.dir === 'rtl' ? 'ltr' : 'rtl';
  }

  increaseProductQty(): void {
    if ( this.productStock !== undefined && this.productQty < this.productStock) {
      this.productQty++;
    } else if (this.productStock === undefined) { // Allow increase if stock is not defined (e.g., unlimited)
      this.productQty++;
    }
  }

  decreaseProductQty(): void {
    if (this.productQty > 1) {
      this.productQty--;
    }
  }

  // Helper for ngb-rating aria-label in loops
  getReviewRatingLabel(rating: number): string {
    // This assumes you have a translation key like: "product.ratingOutOfMax": "{{rating}} out of {{maxRating}} stars"
    return this.translate.instant('product.ratingOutOfMax', { rating: rating, maxRating: this.maxRating });
  }

  // Ensure this method returns SelectedVariation | null
  // It should only include actual selections, not undefined/null values.
  private getSelectedVariations(): SelectedVariation | null {
    if (this.product && this.product.product_options && this.product.product_options.length > 0) {
      if (this.variationsForm.invalid) {
        this.snackBar.open(this.translate.instant('product.selectVariationsError'), this.translate.instant('common.dismiss'), {
          ...this.snackBarConfig,
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
        this.variationsForm.markAllAsTouched(); // Show errors on variation form
        return null; // Indicate invalid selection
      }
      const formValues = this.variationsForm.value;
      const selections: SelectedVariation = {};
      this.product.product_options.forEach(category => {
        const selectedValue = formValues[category.id];
        // Only add to selections if a value is actually chosen
        if (selectedValue !== null && selectedValue !== undefined && String(selectedValue).trim() !== '') {
          selections[category.name] = String(selectedValue); // Using category.name as key, e.g., "Color"
        }
      });
      return selections; // Returns {} if no options selected or no options defined
    }
    return {}; // No variations defined on the product
  }

  // --- New methods for Buy Now and Add to Cart ---
  buyItNow(): void {
    if (!this.product) {
      // ... (error handling)
      return;
    }
    const selectedVariations = this.getSelectedVariations();
    if (selectedVariations === null && this.product.product_options && this.product.product_options.length > 0) {
      // selectedVariations is null if form is invalid and variations are present
      return;
    }

    console.log(`Buy It Now clicked for product: ${this.product.title}, Quantity: ${this.productQty}, Variations:`, selectedVariations);

    this.cartService.addItem(
      this.product as unknown as Product,
      this.productQty,
      this.productStock,
      selectedVariations || {} // Pass the SelectedVariation object (or {} if none)
    );
    this.router.navigate(['/checkout']);
  }

  addToCart(): void {
    if (!this.product) {
      console.error('Add to Cart: Product data is not available.');
      this.snackBar.open(this.translate.instant('product.productNotAvailableError'), this.translate.instant('common.dismiss'), {
        ...this.snackBarConfig,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    const selectedVariations = this.getSelectedVariations();
    // If variations are required and not selected, getSelectedVariations will show a snackbar and return null.
    if (selectedVariations === null && this.product.product_options && this.product.product_options.length > 0) {
      return; // Stop if variations were required but invalid/not selected
    }

    // Call the CartService to add the item
    // We assume ProductDetailsData has the necessary fields of the Product model
    // or you might need to map it to a Product object.
    this.cartService.addItem(
      this.product as unknown as Product, // Cast if ProductDetailsData is a superset of Product
      this.productQty,
      this.productStock,
      selectedVariations || {}
    );

    const message = this.translate.instant('product.addToCartConfirmation', { productName: this.product.title, quantity: this.productQty });
    this.snackBar.open(message, this.translate.instant('common.dismiss'), {
      ...this.snackBarConfig,
    });
  }

  protected readonly length = length;
}
