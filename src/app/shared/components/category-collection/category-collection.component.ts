import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Category} from '../../../core/models/category';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {NgForOf, NgIf, SlicePipe} from '@angular/common';
import {ProductCardComponent} from '../product-card/product-card.component';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Product} from '../../../core/models/product';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';

@UntilDestroy()
@Component({
  selector: 'app-category-collection',
  imports: [
    FaIconComponent,
    NgForOf,
    NgIf,
    ProductCardComponent,
    RouterLink,
    SlicePipe,
    TranslatePipe
  ],
  templateUrl: './category-collection.component.html',
  standalone: true,
  styleUrl: './category-collection.component.scss'
})
export class CategoryCollectionComponent implements OnInit {
  @Input() category!: Category
  @Input() products : Product[] = []
  @Input() limitCount!: number
  @Output() favoriteToggleRequested = new EventEmitter<Product>()
  isLoading: boolean = false
  currentLang!: string
  currentRoute: string = ''

  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowRight = faArrowRight;

  constructor(private translate: TranslateService,
              private route : ActivatedRoute) {}

  ngOnInit() {
    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
    })

    this.currentRoute = this.route.snapshot.url[0]?.path
    if (this.currentRoute) {
    }
  }

  handleFavoriteToggle(product: Product) {
    this.favoriteToggleRequested.emit(product)
  }
}
