import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Product} from '../../../core/models/product';
import {NgClass, NgIf, SlicePipe} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {FavoritesApiService} from '../../../core/services/favorites-api.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ProductImageData} from '../../../features/product-details/models/product-image-data';

@UntilDestroy()
@Component({
  selector: 'app-product-card',
  imports: [
    NgClass,
    NgIf,
    FaIconComponent,
    TranslatePipe,
    SlicePipe,
    RouterLink
  ],
  templateUrl: './product-card.component.html',
  standalone: true,
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Output() favoriteToggleRequested = new EventEmitter<Product>();
  hover = false;
  isAnimating = false; // Flag to trigger the heartbeat animation
  protected readonly faHeartRegular = faHeartRegular;
  protected readonly faHeartSolid = faHeartSolid;

  // This will hold the actual favorite status from the service
  isActuallyFavorite: boolean = false;

  constructor(private favoritesApiService: FavoritesApiService) {}

  ngOnInit(): void {
    if (this.product && this.product.id != null) {
      console.log(`Card [${this.product.id} - ${this.product.title}]: ngOnInit called.`);
      // console.log(`Card [${this.product.id} - ${this.product.name}]: ngOnInit - Subscribing to in_wishlist.`);
      this.favoritesApiService.isFavorite(this.product.id)
        .pipe(untilDestroyed(this))
        .subscribe((isFav:any) => {
          console.log(`Card [${this.product.id} - ${this.product.title}]: Received isFav = ${isFav}. Current isActuallyFavorite = ${this.isActuallyFavorite}`);
          if (this.isActuallyFavorite !== isFav) {
            console.log(`Card [${this.product.id} - ${this.product.title}]: Updating isActuallyFavorite from ${this.isActuallyFavorite} to ${isFav}`);
            this.isActuallyFavorite = isFav;
            // this.cdr.detectChanges(); // Explicitly trigger change detection
          } else {
            console.log(`Card [${this.product.id} - ${this.product.title}]: isFav (${isFav}) is same as isActuallyFavorite. No UI change needed unless forced.`);
            // Even if the value is the same, if an external event (like loadFavorites) triggers this,
            // it's good to ensure Angular checks this component.
            // this.cdr.detectChanges();
          }
        });
    } else {
      console.warn('ProductCardComponent: Input product or product.id is missing or invalid.', this.product);
    }
  }

  onToggleFavorite(event: MouseEvent): void {
    console.log(`Card [${this.product.id} - ${this.product.title}]: onToggleFavorite called.`);
    event.stopPropagation(); // Good practice

    console.log(`Card [${this.product.id} - ${this.product.title}]: isActuallyFavorite = ${this.isActuallyFavorite}`);

    // Trigger animation optimistically if it's about to become a favorite
    if (!this.isActuallyFavorite) {
      this.isAnimating = true;
      setTimeout(() => {
        this.isAnimating = false;
      }, 500);
    }
    this.favoriteToggleRequested.emit(this.product);
  }

  getProductFirstImage(): ProductImageData | null {
    if (this.product.images && this.product.images.length > 0) {
      return this.product.images[0];
    } else {
      return null;
    }
  }
}
