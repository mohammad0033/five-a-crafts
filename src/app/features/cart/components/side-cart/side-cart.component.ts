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
    private titleService: Title,
    private router: Router,
    private translate: TranslateService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.totalAmount$ = this.cartService.totalAmount$;
  }

  ngOnInit(): void {
    this.setPageTitle();
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    // Update title if language changes
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.setPageTitle();
    });
  }

  private setPageTitle(): void {
    // Unsubscribe from previous subscription if it exists to avoid memory leaks
    this.titleSubscription?.unsubscribe();
    this.titleSubscription = this.translate.get('cart.pageTitle').subscribe((pageTitle: string) => {
      this.titleService.setTitle(pageTitle);
    });
  }

  closeCart(): void {
    this.cartService.closeDrawer();
  }

  handleQuantityChange(event: { productId: string | number; newQuantity: number }): void {
    this.cartService.updateItemQuantity(event.productId, event.newQuantity);
  }

  handleRemoveItem(productId: string | number): void {
    // Optional: Add a confirmation dialog before removing
    // e.g., if (confirm(this.translate.instant('cart.confirmRemoveItem'))) { ... }
    this.cartService.removeItem(productId);
  }

  // For *ngFor trackBy to improve performance when re-rendering lists
  trackByCartItemId(index: number, item: CartItem): string | number {
    // A truly unique ID per cart item instance would be best if items can have same product ID but different variations.
    // For now, product.id is a good default if variations aren't distinguishing cart items.
    return item.product.id;
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
