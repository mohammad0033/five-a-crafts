import { Component, OnInit } from '@angular/core'; // Import OnInit
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { TranslatePipe } from '@ngx-translate/core';
import {NgForOf, NgIf} from '@angular/common';
import { OrderDetailsProductComponent } from '../order-details-product/order-details-product.component';
import {Order} from '../../models/order';

@Component({
  selector: 'app-order-details',
  imports: [
    TranslatePipe,
    NgIf,
    OrderDetailsProductComponent,
    NgForOf
  ],
  templateUrl: './order-details.component.html',
  standalone: true,
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit { // Implement OnInit
  order: Order | null = null; // Type the order and initialize as null
  isLoading: boolean = true; // Add loading state

  constructor(private route: ActivatedRoute) { } // Inject ActivatedRoute

  ngOnInit(): void {
    // Data is already resolved, so loading is brief or handled by parent resolver
    // If the parent resolver handles global loading, you might not need this component's isLoading
    // But it's good practice to have it in case the resolver fails or returns null
    this.isLoading = true; // Assume loading until data is processed

    this.route.data.subscribe(data => {
      // Access the resolved data using the key defined in the route config
      const resolvedOrder = data['orderDetails'] as Order | null; // Use the key 'orderDetails'

      if (resolvedOrder) {
        this.order = resolvedOrder;
        console.log('OrderDetailsComponent: Received order data', this.order);
      } else {
        this.order = null; // Order was not found or resolver returned null
        console.warn('OrderDetailsComponent: No order data received.');
        // The resolver already handled navigation for not found/error,
        // but you might show a local message here too if needed.
      }
      this.isLoading = false; // Data processing finished
    });
  }
}
