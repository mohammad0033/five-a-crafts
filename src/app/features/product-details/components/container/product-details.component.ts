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
import {ActivatedRoute, RouterLink} from '@angular/router';
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
import {Observable, timer} from 'rxjs';
import {Product} from '../../../../core/models/product';
import {ProductsSliderComponent} from '../../../../shared/components/products-slider/products-slider.component';
import {MatSnackBar, MatSnackBarConfig, MatSnackBarModule} from '@angular/material/snack-bar';
import {CartService} from '../../../../core/services/cart.service';

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
    private translate: TranslateService,
    private productsApiService: ProductsApiService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private cartService: CartService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.variationsForm = this.fb.group({}); // Initialize an empty group
  }

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang;
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang;
      this.toggleDir();
    });

    this.initReviewForm(); // Initialize the review form

    // Product data from resolver
    const resolvedProduct = this.route.snapshot.data['productData'] as ProductDetailsData | null;
    this.isLoading = true; // Start with loading true

    if (resolvedProduct) {
      this.product = resolvedProduct;
      this.initializeVariationsForm(); // Call this after product is set
      this.errorLoading = false;
      // Meta tags, images, stock setup
      const canonicalUrl = `https://www.yourdomain.com/products/${this.product.slug}`;
      this.metaTagService.setTags(
        this.product.metadata, this.fallbackMetaData,
        { canonicalUrl, ogType: 'product', twitterHandle: this.twitterHandle }
      );
      this.productStock = this.product.stockQuantity;
      this.images = Array.isArray(this.product.images)
        ? this.product.images.map(item => new ImageItem({ src: item.url, thumb: item.url }))
        : [];

      // Fetch reviews for this product
      this.loadProductReviews(this.product.slug);
      // isLoading will be set to false after reviews are also loaded or fail

    } else {
      this.product = null;
      this.isLoading = false; // Finished loading attempt (failed)
      this.errorLoading = true;
      console.error('Failed to load product details from resolver.');
      const canonicalUrl = `https://www.yourdomain.com/`;
      this.metaTagService.setTags(null, this.fallbackMetaData, { canonicalUrl, ogType: 'website', twitterHandle: this.twitterHandle });
    }

    // get you may also like
    this.productsYouMayLike$ = this.productsApiService.getProductsYouMayLike();

    // get recently viewed
    this.recentlyViewedProducts$ = this.productsApiService.getRecentlyViewedProducts();
  }

  private initializeVariationsForm(): void {
    if (this.product && this.product.variations) {
      const groupConfig: { [key: string]: any } = {};
      this.product.variations.forEach(category => {
        // Set initial value: either pre-selected from backend, or first option, or null
        const initialValue = category.selectedValue || (category.options.length > 0 ? category.options[0].value : null);
        groupConfig[category.id] = [initialValue, Validators.required]; // Example: make each variation required
        // If you don't want to pre-select, you can set initialValue to null
        // and remove category.selectedValue from your interface or ignore it here.
      });
      this.variationsForm = this.fb.group(groupConfig);

      // Optional: If you still want to use category.selectedValue for display in the template
      // you can subscribe to form changes to update it, or derive it from form value.
      this.variationsForm.valueChanges.pipe(untilDestroyed(this)).subscribe(values => {
        this.product?.variations?.forEach(cat => {
          cat.selectedValue = values[cat.id];
        });
        console.log('Variation Form Values:', values);
      });
    }
  }

  private initReviewForm(): void {
    this.reviewForm = this.fb.group({
      // productId: [null], // We'll add productId directly from this.product.id when submitting
      rating: [0, [Validators.required, Validators.min(1), Validators.max(this.maxRating)]],
      comment: ['', [Validators.required, Validators.minLength(5)]] // Added minLength for example
    });
  }

  private loadProductReviews(productSlug: string): void {
    this.productsApiService.getProductReviews(productSlug)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (reviewsDataFromApi) => {
          this.reviewsData = reviewsDataFromApi;
          this.allProductReviews = reviewsDataFromApi.reviewsList || [];
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
    return this.product ? `/categories/${this.product.category.slug}` : null;
  }

  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    if (this.product) {
      this.product.isFavorite = !this.product.isFavorite;
      if (this.product.isFavorite) {
        this.isAnimating = true;
        setTimeout(() => { this.isAnimating = false; }, 500);
      }
      this.favoriteToggled.emit(this.product);
      console.log(`Favorite status for ${this.product.name}: ${this.product.isFavorite}`);
    } else {
      console.error('Product data is null. Cannot toggle favorite.');
    }
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

  private getSelectedVariations(): { [key: string]: string | undefined } {
    if (this.variationsForm.valid) { // Or just this.variationsForm.value if not all are required
      // You might want to map the form value to match the previous structure if needed
      const formValues = this.variationsForm.value;
      const selections: { [key: string]: string | undefined } = {};
      this.product?.variations?.forEach(category => {
        selections[category.name] = formValues[category.id];
      });
      return selections;
      // Or simply return this.variationsForm.value;
    }
    return {}; // Or handle invalid form appropriately
  }

  // --- New methods for Buy Now and Add to Cart ---
  buyItNow(): void {
    if (!this.product) {
      console.error('Buy It Now: Product data is not available.');
      this.snackBar.open(this.translate.instant('product.productNotAvailableError'), this.translate.instant('common.dismiss'), {
        ...this.snackBarConfig,
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }
    const selectedVariations = this.getSelectedVariations();
    if (selectedVariations === null && this.product.variations && this.product.variations.length > 0) {
      // getSelectedVariations already showed a snackbar for invalid variations
      return;
    }

    console.log(`Buy It Now clicked for product: ${this.product.name}, Quantity: ${this.productQty}, Variations:`, selectedVariations);
    // TODO: Implement actual "Buy It Now" logic:
    // 1. Add item to cart (maybe clear cart first or use a separate "buy now" cart state)
    // 2. Redirect to checkout
    this.cartService.addItem(
      this.product, // Assuming ProductDetailsData is compatible or can be cast
      this.productQty,
      this.productStock,
      selectedVariations
    );
    // For "Buy Now", you might want to navigate directly to checkout
    // this.router.navigate(['/checkout']); // Make sure Router is injected if you use this
    const message = this.translate.instant('product.buyNowConfirmation', { productName: this.product.name });
    this.snackBar.open(message, this.translate.instant('common.dismiss'), this.snackBarConfig);
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
    if (selectedVariations === null && this.product.variations && this.product.variations.length > 0) {
      return; // Stop if variations were required but invalid/not selected
    }

    // Call the CartService to add the item
    // We assume ProductDetailsData has the necessary fields of the Product model
    // or you might need to map it to a Product object.
    this.cartService.addItem(
      this.product as Product, // Cast if ProductDetailsData is a superset of Product
      this.productQty,
      this.productStock,
      selectedVariations
    );

    const message = this.translate.instant('product.addToCartConfirmation', { productName: this.product.name, quantity: this.productQty });
    this.snackBar.open(message, this.translate.instant('common.dismiss'), {
      ...this.snackBarConfig,
    });

    // Optionally, open the cart drawer after adding an item
    this.cartService.openDrawer();
  }
}
