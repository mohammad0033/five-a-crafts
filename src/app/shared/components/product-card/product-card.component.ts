import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Product} from '../../../core/models/product';
import {NgClass, NgIf, SlicePipe} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';

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
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() favoriteToggled = new EventEmitter<Product>();
  hover = false;
  isAnimating = false; // Flag to trigger the heartbeat animation
  protected readonly faHeartRegular = faHeartRegular;
  protected readonly faHeartSolid = faHeartSolid;

  toggleFavorite(event: MouseEvent): void {
    // Prevent the click from bubbling up to parent elements if needed
    event.stopPropagation();

    // Toggle the favorite status on the product object
    // Note: Modifying @Input directly is simple but can be considered bad practice.
    // Emitting an event (like favoriteToggled) is often preferred.
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
  }
}
