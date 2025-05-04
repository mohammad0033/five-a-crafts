import {Component, OnInit} from '@angular/core';
import {ProductDetailsData} from '../../models/product-details-data';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-product-details',
  imports: [],
  templateUrl: './product-details.component.html',
  standalone: true,
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {

  // Property to hold the resolved product data
  public product: ProductDetailsData | null = null;
  public isLoading: boolean = true; // Manage loading state if needed within component
  public errorLoading: boolean = false; // Manage error state

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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
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
}
