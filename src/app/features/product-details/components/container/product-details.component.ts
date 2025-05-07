import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {ProductDetailsData} from '../../models/product-details-data';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {isPlatformBrowser, NgClass, NgIf} from '@angular/common';
import {LightboxModule} from 'ng-gallery/lightbox';
import {GalleryComponent, GalleryItem, GalleryModule, ImageItem} from 'ng-gallery';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import {faHeart as faHeartSolid, faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import { BidiModule, Direction } from '@angular/cdk/bidi';

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
  ],
  templateUrl: './product-details.component.html',
  standalone: true,
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  @Output() favoriteToggled: EventEmitter<ProductDetailsData> = new EventEmitter<ProductDetailsData>();

  protected readonly faHeartRegular = faHeartRegular;
  protected readonly faHeartSolid = faHeartSolid;
  protected readonly faPlus = faPlus;
  protected readonly faMinus = faMinus;

  // Property to hold the resolved product data
  product: ProductDetailsData | null = null;
  images: GalleryItem[] = []; // Main product images
  isLoading: boolean = true; // Manage loading state if needed within component
  errorLoading: boolean = false; // Manage error state
  isBrowser = false;
  isAnimating = false; // Flag to trigger the heartbeat animation
  productQty = 1;
  productStock : number | undefined = 0
  currentLang!: string
  dir: Direction = 'rtl';

  // --- Fallback Metadata Content (used ONLY if resolver returns null) ---
  private readonly fallbackMetaData: FallbackMetaTagData = {
    title: 'Product Details | Five A Crafts',
    description: 'Explore detailed information about our handcrafted and sustainable products available at Five A Crafts.',
    ogImageUrl: 'https://www.yourdomain.com/assets/og-image-default-product.jpg',
    twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image-default-product.jpg'
  };
  private readonly twitterHandle = '@YourTwitterHandle'; // Replace

  constructor(
    private metaTagService: MetaTagService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
      this.toggleDir()
    })

    // Access the resolved data using the new key 'productData'
    this.product = this.route.snapshot.data['productData'] as ProductDetailsData | null;
    this.isLoading = false; // Data resolution is complete by now

    if (this.product) {
      this.errorLoading = false;
      // Construct the canonical URL using the fetched slug
      const canonicalUrl = `https://www.yourdomain.com/products/${this.product.slug}`; // Adjust domain

      // Set meta tags using the metadata nested within the product data
      this.metaTagService.setTags(
        this.product.metadata, // Pass the nested metadata object
        this.fallbackMetaData, // Still provide fallbacks in case metadata is incomplete
        {
          canonicalUrl: canonicalUrl,
          ogType: 'product',
          twitterHandle: this.twitterHandle
        }
      );
      // Now you can use this.product in your template to display details
      console.log('Product details loaded:', this.product);

      this.productStock = this.product.stockQuantity

      // Populate the gallery with product images
      this.images = Array.isArray(this.product.images)
        ? this.product.images.map(item => new ImageItem({ src: item.url, thumb: item.url }))
        : [];

    } else {
      // Handle the case where the resolver returned null (e.g., product not found)
      this.errorLoading = true;
      console.error('Failed to load product details.');
      // Set fallback meta tags explicitly if product data is null
      const canonicalUrl = `https://www.yourdomain.com/`; // Fallback canonical? Or maybe 404 page canonical
      this.metaTagService.setTags(
        null, // No API metadata
        this.fallbackMetaData,
        {
          canonicalUrl: canonicalUrl, // Decide on appropriate fallback URL
          ogType: 'website', // Fallback type
          twitterHandle: this.twitterHandle
        }
      );
      // You might want to show an error message in the template
    }
  }

  // Example method to use in template for breadcrumbs
  get categoryLink(): string | null {
    return this.product ? `/categories/${this.product.category.slug}` : null;
  }

  toggleFavorite(event: MouseEvent): void {
    // Prevent the click from bubbling up to parent elements if needed
    event.stopPropagation();

    // Toggle the favorite status on the product object
    // Note: Modifying @Input directly is simple but can be considered bad practice.
    // Emitting an event (like favoriteToggled) is often preferred.
    if (this.product) {
      this.product.isFavorite = !this.product.isFavorite;
      // Trigger animation only when adding to favorites
      if (this.product.isFavorite) {
        this.isAnimating = true;
        // Remove the animation class after the animation completes (500ms)
        setTimeout(() => {
          this.isAnimating = false;
        }, 500); // Duration should match the CSS animation duration
      }

      // Emit the event with the updated product data
      this.favoriteToggled.emit(this.product);

      // You might want to call a service here to persist the change
      console.log(`Favorite status for ${this.product.name}: ${this.product.isFavorite}`);
    } else {
      console.error('Product data is null. Cannot toggle favorite.');
    }
  }

  toggleDir() {
    this.dir = this.dir === 'rtl' ? 'ltr' : 'rtl';
  }

  increaseProductQty(): void {
    // dont exceed the stock quantity
    if ( this.productStock && this.productQty < this.productStock) {
      this.productQty++;
    }
  }

  decreaseProductQty(): void {
    if (this.productQty > 1) {
      this.productQty--;
    }
  }
}
