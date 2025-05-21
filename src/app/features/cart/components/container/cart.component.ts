import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {CartService} from '../../../../core/services/cart.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faShoppingBag} from '@fortawesome/free-solid-svg-icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {CartProductComponent} from '../cart-product/cart-product.component';
import {CartItem} from '../../models/cart-item';
import {Observable, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {ContactSectionComponent} from '../../../../shared/components/contact-section/contact-section.component';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-cart',
  imports: [
    FaIconComponent,
    TranslatePipe,
    NgIf,
    AsyncPipe,
    CartProductComponent,
    NgForOf,
    ContactSectionComponent
  ],
  templateUrl: './cart.component.html',
  standalone: true,
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems$: Observable<CartItem[]>;
  subtotal$: Observable<number>;     // Will hold the subtotal before discount/shipping
  discount$: Observable<number>;     // From CartService
  shippingFee$: Observable<number>;  // From CartService
  totalAmount$: Observable<number>;   // This will be the final grand total from CartService

  private titleSubscription?: Subscription;

  protected readonly faShoppingBag = faShoppingBag;

  constructor(
    private metaService: Meta,
    public cartService: CartService, // Made public for easier access if needed, though direct observable binding is preferred
    private titleService: Title,
    private router: Router,
    private translate: TranslateService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.subtotal$ = this.cartService.subtotal$;         // Get subtotal from service
    this.discount$ = this.cartService.discount$;         // Get discount from service
    this.shippingFee$ = this.cartService.shippingFee$;   // Get shipping fee from service
    this.totalAmount$ = this.cartService.totalAmount$;   // Get final total amount from service
  }

  ngOnInit(): void {
    this.setPageTitle();
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
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

  // Updated to expect cartItemId
  handleQuantityChange(event: { cartItemId: string; newQuantity: number }): void {
    this.cartService.updateItemQuantity(event.cartItemId, event.newQuantity);
  }

  // Updated to expect cartItemId (string)
  handleRemoveItem(cartItemId: string): void {
    // Optional: Add a confirmation dialog before removing
    // e.g., if (confirm(this.translate.instant('cart.confirmRemoveItem'))) { ... }
    this.cartService.removeItem(cartItemId);
  }

  // Updated to use the unique cart item ID
  trackByCartItemId(index: number, item: CartItem): string {
    return item.id; // Use the unique cart item ID (string)
  }

  closeCartAndNavigateToShop(): void {
    this.router.navigate(['/categories']); // Adjust this route to your actual shop page
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']); // Adjust this route to your actual checkout page
    // console.log('Proceeding to checkout with items:', this.cartService.cartItems.value);
  }

  ngOnDestroy(): void {
    this.metaService.removeTag("name='robots'");
    this.titleSubscription?.unsubscribe();
  }
}
