import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faMinus, faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';
import {TranslatePipe} from '@ngx-translate/core';
import {NgForOf, NgIf} from '@angular/common';
import {CartItem} from '../../models/cart-item';

@Component({
  selector: 'app-cart-product',
  imports: [
    FaIconComponent,
    TranslatePipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './cart-product.component.html',
  standalone: true,
  styleUrl: './cart-product.component.scss'
})
export class CartProductComponent implements OnInit {
  @Input() item!: CartItem; // Changed to accept the full CartItem

  // Optional: Outputs to communicate changes back to the cart service via CartComponent
  @Output() quantityChange = new EventEmitter<{ cartItemId: string, newQuantity: number }>();
  @Output() removeItem = new EventEmitter<string>(); // cartItemId is a string

  protected readonly faTrash = faTrash;
  protected readonly faMinus = faMinus;
  protected readonly faPlus = faPlus;

  ngOnInit(): void {
    // item.quantity should be valid from CartService
    // Optional: Add a check if item is not provided, though Angular's ! should enforce it.
    if (!this.item) {
      console.error('CartProductComponent: Item input is missing!');
      // Potentially handle this error, e.g., by not rendering or showing a message
      return;
    }
    if (this.item.quantity === undefined || this.item.quantity < 1) {
      // This case should ideally be prevented by CartService logic
      // but as a fallback, you might want to emit a remove or set to 1.
      // For now, we'll assume CartService ensures quantity is valid.
      console.warn('CartProductComponent: Item quantity is invalid.', this.item);
    }
  }

  increaseProductQty(): void {
    const stockLimit = this.item.originalStock ?? Infinity;
    if (this.item.quantity < stockLimit) {
      const newQuantity = this.item.quantity + 1;
      // Emit cartItemId (item.id)
      this.quantityChange.emit({ cartItemId: this.item.id, newQuantity: newQuantity });
    }
  }

  decreaseProductQty(): void {
    if (this.item.quantity > 1) {
      const newQuantity = this.item.quantity - 1;
      // Emit cartItemId (item.id)
      this.quantityChange.emit({ cartItemId: this.item.id, newQuantity: newQuantity });
    } else if (this.item.quantity === 1) {
      // Optional: If quantity becomes 0, you might want to trigger remove directly
      // or let the parent decide. For now, we only decrease if > 1.
      // If you want to remove on 0, call triggerRemoveItem() or emit a specific event.
      // For consistency with current behavior, we'll only allow decrease if > 1.
      // To remove when quantity reaches 0, the parent (CartComponent/SideCartComponent)
      // would handle the newQuantity: 0 from updateItemQuantity in CartService.
    }
  }

  triggerRemoveItem(): void {
    // Emit cartItemId (item.id)
    this.removeItem.emit(this.item.id);
  }

  // Helper to display variations if they exist
  get variationKeys(): string[] {
    return this.item.selectedVariations ? Object.keys(this.item.selectedVariations) : [];
  }
}
