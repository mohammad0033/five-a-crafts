import {PageMetadata} from './page-meta-data';

export interface MetaTagData extends PageMetadata {
  // Add properties that might vary per page but aren't in PageMetadata API response
  ogType?: string; // e.g., 'website', 'article'
  canonicalUrl: string; // The specific canonical URL for the page being set
  twitterHandle?: string; // Optional site twitter handle
}
