import {Component, OnDestroy, OnInit} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {CartProductComponent} from '../cart-product/cart-product.component';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faClose, faShoppingBag} from '@fortawesome/free-solid-svg-icons';
import {MatButton, MatIconButton} from '@angular/material/button';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Observable, Subscription} from 'rxjs';
import {CartItem} from '../../models/cart-item';
import {Meta, Title} from '@angular/platform-browser';
import {CartService} from '../../../../core/services/cart.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-side-cart',
  imports: [
    AsyncPipe,
    CartProductComponent,
    FaIconComponent,
    MatButton,
    MatIconButton,
    NgForOf,
    NgIf,
    TranslatePipe
  ],
  templateUrl: './side-cart.component.html',
  standalone: true,
  styleUrl: './side-cart.component.scss'
})
export class SideCartComponent implements OnInit, OnDestroy {
  cartItems$: Observable<CartItem[]>;
  totalAmount$: Observable<number>;

  private titleSubscription?: Subscription;
  private langChangeSubscription?: Subscription;

  protected readonly faClose = faClose;
  protected readonly faShoppingBag = faShoppingBag;

  constructor(
    private metaService: Meta,
    public cartService: CartService, // Made public for easier access if needed, though direct observable binding is preferred
    private router: Router) {
    this.cartItems$ = this.cartService.cartItems$;
    this.totalAmount$ = this.cartService.totalAmount$;
  }

  ngOnInit(): void {
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  closeCart(): void {
    this.cartService.closeDrawer();
  }

  // Event from CartProductComponent should now emit cartItemId and newQuantity
  handleQuantityChange(event: { cartItemId: string; newQuantity: number }): void {
    this.cartService.updateItemQuantity(event.cartItemId, event.newQuantity);
  }

  handleRemoveItem(cartItemId: string): void {
    // Optional: Add a confirmation dialog before removing
    // e.g., if (confirm(this.translate.instant('cart.confirmRemoveItem'))) { ... }
    console.log(`Removing item with cart ID: ${cartItemId}`);
    this.cartService.removeItem(cartItemId);
  }

  // For *ngFor trackBy to improve performance when re-rendering lists
  // Use the unique cart item ID for trackBy
  trackByCartItemId(index: number, item: CartItem): string {
    return item.id;
  }

  closeCartAndNavigateToShop(): void {
    this.cartService.closeDrawer();
    this.router.navigate(['/categories']); // Adjust this route to your actual shop page
  }

  proceedToCheckout(): void {
    this.cartService.closeDrawer();
    this.router.navigate(['/checkout']); // Adjust this route to your actual checkout page
    // console.log('Proceeding to checkout with items:', this.cartService.cartItems.value);
  }

  proceedToCart(): void {
    this.cartService.closeDrawer();
    this.router.navigate(['/cart']); // Adjust this route to your actual cart page
    // console.log('Proceeding to cart with items:', this.cartService.cartItems.value);
  }

  ngOnDestroy(): void {
    this.metaService.removeTag("name='robots'");
    this.titleSubscription?.unsubscribe();
    this.langChangeSubscription?.unsubscribe();
  }

}
