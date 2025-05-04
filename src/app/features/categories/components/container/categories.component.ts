import {Component, OnInit} from '@angular/core';
import {PageMetadata} from '../../../../core/models/page-meta-data';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [],
  templateUrl: './categories.component.html',
  standalone: true,
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit { // Implement OnInit

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


  constructor(
    private metaTagService: MetaTagService, // Inject the service
    private route: ActivatedRoute         // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
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

    // Add logic here later to load the actual category list content
  }
}
