import {Component, OnInit} from '@angular/core';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {ActivatedRoute} from '@angular/router';
import {PageMetadata} from '../../../../core/models/page-meta-data';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  standalone: true,
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit { // Implement OnInit

  // --- Fallback Metadata Content for Contact Page ---
  private readonly fallbackData: FallbackMetaTagData = {
    title: 'Contact Us | Five A Crafts',
    description: 'Get in touch with the Five A Crafts team. We are here to help with your questions about our' +
      ' handcrafted products, orders, or sustainability practices.',
    // --- Replace placeholders ---
    ogImageUrl: 'https://www.yourdomain.com/assets/og-image-contact.jpg', // Use a relevant default OG image
    twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image-contact.jpg' // Use a relevant default Twitter image
  };
  // --- Page Specific Data ---
  private readonly canonicalUrl = 'https://www.yourdomain.com/contact'; // Replace with your actual domain/path
  private readonly twitterHandle = '@YourTwitterHandle'; // Replace (optional)
  // --- End of Placeholders ---


  constructor(
    private metaTagService: MetaTagService, // Inject the service
    private route: ActivatedRoute         // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Access the resolved data (key 'metaData' must match routing)
    const resolvedMetaData = this.route.snapshot.data['metaData'] as PageMetadata | null;

    // Call the service to set tags for the Contact page
    this.metaTagService.setTags(
      resolvedMetaData,
      this.fallbackData, // Use the Contact page's specific fallbacks
      {
        canonicalUrl: this.canonicalUrl, // Use the Contact page's canonical URL
        ogType: 'website', // Appropriate for a contact page
        twitterHandle: this.twitterHandle
      }
    );

    // Add logic here later to load the actual contact form/info content
  }
}
