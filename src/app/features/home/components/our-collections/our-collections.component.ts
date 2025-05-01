import {Component, OnInit} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgForOf, NgIf, SlicePipe} from '@angular/common';
import {Product} from '../../../../core/models/product';
import {ProductsService} from '../../../../core/services/products.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ProductCardComponent} from '../../../../shared/components/product-card/product-card.component';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {RouterLink} from '@angular/router';
import {finalize} from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-our-collections',
  imports: [
    TranslatePipe,
    NgIf,
    NgForOf,
    ProductCardComponent,
    SlicePipe,
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './our-collections.component.html',
  standalone: true,
  styleUrl: './our-collections.component.scss'
})
export class OurCollectionsComponent implements OnInit {
  products : Product[] = []
  isLoading: boolean = false
  currentLang!: string

  constructor(private productsService: ProductsService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
    })

    this.isLoading = true;
    this.productsService.getCandlesCollectionProducts()
      .pipe(
        untilDestroyed(this), // Use the untilDestroyed operator
        finalize(() => (this.isLoading = false)) // Set isLoading to false when the observable completes
      )
      .subscribe({
        next: (data) => {
          this.products = data;
          console.log('Candles Collection products loaded:', this.products);
        },
        error: (err) => {
          console.error('Error fetching candles collection products:', err);
        }
      });
  }

  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowRight = faArrowRight;
}
