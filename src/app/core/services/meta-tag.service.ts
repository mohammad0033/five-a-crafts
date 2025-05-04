import { Injectable } from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {PageMetadata} from '../models/page-meta-data';
import {FallbackMetaTagData} from '../models/fallback-meta-tag-data';

@Injectable({
  providedIn: 'root'
})
export class MetaTagService {

  constructor(
    private titleService: Title,
    private metaService: Meta) { }

  /**
   * Sets the standard meta tags for a page using API data or fallbacks.
   * @param apiMetadata - Metadata fetched from the API (or null if fetch failed).
   * @param fallbackData - Fallback values specific to the page.
   * @param pageSpecificData - Data like canonical URL and OG type specific to the page.
   */
  public setTags(
    apiMetadata: PageMetadata | null,
    fallbackData: FallbackMetaTagData,
    pageSpecificData: { canonicalUrl: string; ogType?: string; twitterHandle?: string }
  ): void {

    // Determine final values using API data or fallbacks
    const title = apiMetadata?.title || fallbackData.title;
    const description = apiMetadata?.description || fallbackData.description;
    const ogImageUrl = apiMetadata?.ogImageUrl || fallbackData.ogImageUrl;
    const twitterImageUrl = apiMetadata?.twitterImageUrl || fallbackData.twitterImageUrl;
    const ogType = pageSpecificData.ogType || 'website'; // Default to 'website'
    const canonicalUrl = pageSpecificData.canonicalUrl;
    const twitterHandle = pageSpecificData.twitterHandle;

    // --- Set Tags ---

    // Page Title
    this.titleService.setTitle(title);

    // Meta Description
    this.metaService.updateTag({ name: 'description', content: description });

    // Open Graph Tags
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: ogType });
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
    this.metaService.updateTag({ property: 'og:image', content: ogImageUrl });
    // Add og:image:width, og:image:height if you have standard dimensions (e.g., 1200x630)
    // this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
    // this.metaService.updateTag({ property: 'og:image:height', content: '630' });


    // Twitter Card Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: twitterImageUrl });
    if (twitterHandle) {
      this.metaService.updateTag({ name: 'twitter:site', content: twitterHandle });
    } else {
      // Ensure tag is removed if it exists but no handle is provided now
      this.metaService.removeTag("name='twitter:site'");
    }

    // --- Important for SSR/Static Generation ---
    // While og:url is set, managing the actual <link rel="canonical"> tag dynamically
    // often requires direct DOM manipulation or specific libraries, especially if
    // you need it updated precisely per route after initial load.
    // The Meta service doesn't directly handle <link> tags.
    // For SSR, ensuring the correct canonical is in index.html or using TransferState
    // might be necessary for complex cases. For now, og:url covers social sharing.
  }
}
