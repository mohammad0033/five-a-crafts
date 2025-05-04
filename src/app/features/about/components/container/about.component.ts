import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {PageMetadata} from '../../../../core/models/page-meta-data';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  standalone: true,
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit { // Implement OnInit

  // --- Fallback Metadata Content for About Page ---
  private readonly fallbackData: FallbackMetaTagData = {
    title: 'About Us | Five A Crafts',
    description: 'Learn more about the story, mission, and values behind Five A Crafts and our commitment to sustainable, handcrafted goods.',
    // --- Replace placeholders ---
    ogImageUrl: 'https://www.yourdomain.com/assets/og-image-about.jpg', // Use a relevant default OG image
    twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image-about.jpg' // Use a relevant default Twitter image
  };
  // --- Page Specific Data ---
  private readonly canonicalUrl = 'https://www.yourdomain.com/about'; // Replace with your actual domain/path
  private readonly twitterHandle = '@YourTwitterHandle'; // Replace (optional, could be same as home)
  // --- End of Placeholders ---


  constructor(
    private metaTagService: MetaTagService, // Inject the service
    private route: ActivatedRoute         // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Access the resolved data (key 'metaData' must match routing)
    const resolvedMetaData = this.route.snapshot.data['metaData'] as PageMetadata | null;

    // Call the service to set tags for the About page
    this.metaTagService.setTags(
      resolvedMetaData,
      this.fallbackData, // Use the About page's specific fallbacks
      {
        canonicalUrl: this.canonicalUrl, // Use the About page's canonical URL
        ogType: 'article', // Or 'profile' or 'website' depending on content
        twitterHandle: this.twitterHandle
      }
    );
  }
}
