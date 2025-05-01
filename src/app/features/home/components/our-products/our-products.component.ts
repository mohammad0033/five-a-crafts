import {Component, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductsSliderComponent} from '../../../../shared/components/products-slider/products-slider.component';
import {NgIf} from '@angular/common';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ProductsService} from '../../../../core/services/products.service';
import {Product} from '../../../../core/models/product';
import {finalize} from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-our-products',
  imports: [
    TranslatePipe,
    ProductsSliderComponent,
    NgIf
  ],
  templateUrl: './our-products.component.html',
  standalone: true,
  styleUrl: './our-products.component.scss'
})
export class OurProductsComponent implements OnInit {
  products : Product[] = []
  isLoading: boolean = true;

  constructor(private productsService: ProductsService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.productsService.getBestSellingProducts()
      .pipe(
        untilDestroyed(this), // Use the untilDestroyed operator
        finalize(() => (this.isLoading = false)) // Set isLoading to false when the observable completes
      )
      .subscribe({
        next: (data) => {
          this.products = data;
          console.log('Best selling products loaded:', this.products);
        },
        error: (err) => {
          console.error('Error fetching best selling products:', err);
        }
      });
  }
}
