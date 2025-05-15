import {Component, Input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {NgIf} from '@angular/common';
import {OrderProduct} from '../../models/order-product';

@Component({
  selector: 'app-order-details-product',
  imports: [
    TranslatePipe,
    NgIf
  ],
  templateUrl: './order-details-product.component.html',
  standalone: true,
  styleUrl: './order-details-product.component.scss'
})
export class OrderDetailsProductComponent {
  @Input() product!: OrderProduct
}
