import {Component, OnInit} from '@angular/core';
import {HeroCarouselComponent} from '../hero-carousel/hero-carousel.component';
import {OurProductsComponent} from '../our-products/our-products.component';
import {HomeCategoriesComponent} from '../home-categories/components/container/home-categories.component';
import {OurCollectionsComponent} from '../our-collections/our-collections.component';
import {ActivatedRoute} from '@angular/router';
import {PageMetadata} from '../../../../core/models/page-meta-data';
import {MetaTagService} from '../../../../core/services/meta-tag.service';
import {FallbackMetaTagData} from '../../../../core/models/fallback-meta-tag-data';
import {TranslatePipe} from '@ngx-translate/core';
import {ContactSectionComponent} from '../../../../shared/components/contact-section/contact-section.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroCarouselComponent,
    OurProductsComponent,
    HomeCategoriesComponent,
    OurCollectionsComponent,
    TranslatePipe,
    ContactSectionComponent
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  // Fallback Metadata Content (structured for the service)
  private readonly fallbackData: FallbackMetaTagData = {
    title: 'Five A Crafts | Artisan Handcrafted & Sustainable Goods',
    description: 'Discover Five A Crafts – an e-commerce platform dedicated to artisan-crafted, ' +
      'sustainable goods. Shop unique, handcrafted items that bring warmth to your home and heart.',
    //  Replace placeholders below with your actual URLs
    ogImageUrl: 'https://www.yourdomain.com/assets/og-image.jpg', //  Replace
    twitterImageUrl: 'https://www.yourdomain.com/assets/twitter-image.jpg' //  Replace
   };

  // Page Specific Data
  private readonly canonicalUrl = 'https://www.yourdomain.com/'; //  Replace
  private readonly twitterHandle = '@YourTwitterHandle'; //  Replace
  // --- End of Placeholders ---

  constructor(
    // Inject MetaTagService instead of Title/Meta
    private metaTagService: MetaTagService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const resolvedMetaData = this.route.snapshot.data['metaData'] as PageMetadata | null;

    // Call the service to set tags
    this.metaTagService.setTags(
      resolvedMetaData,
      this.fallbackData,
      // page specific data
      {
        canonicalUrl: this.canonicalUrl,
        ogType: 'website', // Specific type for home page
        twitterHandle: this.twitterHandle
      }
    );
  }
}
