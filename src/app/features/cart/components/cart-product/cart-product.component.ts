import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Product} from '../../../../core/models/product';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faMinus, faPlus, faTrash} from '@fortawesome/free-solid-svg-icons';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-cart-product',
  imports: [
    FaIconComponent,
    TranslatePipe
  ],
  templateUrl: './cart-product.component.html',
  standalone: true,
  styleUrl: './cart-product.component.scss'
})
export class CartProductComponent implements OnInit {
  @Input() product!: Product;
  @Input() productStock?: number; // Max available stock for this product (originalStock from CartItem)
  @Input() productQty!: number;   // Quantity of THIS item in the cart (from CartItem.quantity)

  // Optional: Outputs to communicate changes back to the cart service via CartComponent
  @Output() quantityChange = new EventEmitter<{ productId: string | number, newQuantity: number }>();
  @Output() removeItem = new EventEmitter<string | number>();

  protected readonly faTrash = faTrash;
  protected readonly faMinus = faMinus;
  protected readonly faPlus = faPlus;

  ngOnInit(): void {
    // Ensure productQty is at least 1 if not properly provided, though it should be by CartComponent
    if (this.productQty === undefined || this.productQty < 1) {
      this.productQty = 1;
    }
  }

  increaseProductQty(): void {
    const stockLimit = this.productStock ?? Infinity; // If no stock info, assume no limit for increase
    if (this.productQty < stockLimit) {
      this.productQty++;
      this.quantityChange.emit({ productId: this.product.id, newQuantity: this.productQty });
    }
  }

  decreaseProductQty(): void {
    if (this.productQty > 1) {
      this.productQty--;
      this.quantityChange.emit({ productId: this.product.id, newQuantity: this.productQty });
    }
  }

  triggerRemoveItem(): void {
    this.removeItem.emit(this.product.id);
  }
}
