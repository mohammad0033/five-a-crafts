import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable()
export class CustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  // Translations (will update default labels)
  firstPageLabel = 'First page';
  itemsPerPageLabel = 'Items per page:';
  lastPageLabel = 'Last page';
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';
  ofLabel = 'of'; // For the range label

  constructor(private translate: TranslateService) {
    this.translate.onLangChange
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.updateLabels();
      });
    this.updateLabels(); // Initial update
  }

  private updateLabels() {
    this.firstPageLabel = this.translate.instant('paginator.firstPageLabel');
    this.itemsPerPageLabel = this.translate.instant('paginator.itemsPerPageLabel');
    this.lastPageLabel = this.translate.instant('paginator.lastPageLabel');
    this.nextPageLabel = this.translate.instant('paginator.nextPageLabel');
    this.previousPageLabel = this.translate.instant('paginator.previousPageLabel');
    this.ofLabel = this.translate.instant('paginator.ofLabel'); // For "Page X of Y"
    this.changes.next(); // Notify the paginator that labels have changed
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      // Use translated string for "0 of X" or "Page 1 of 1" when no items
      return this.translate.instant('paginator.rangePageLabelWhenNoItems', {
        length,
      });
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;

    // Example: "1 – 10 of 100"
    // return `${startIndex + 1} – ${endIndex} ${this.ofLabel} ${length}`;

    // Example: "Page 1 of 10"
    const amountPages = Math.ceil(length / pageSize);
    return this.translate.instant('paginator.rangePageLabel', {
      currentPage: page + 1,
      totalPages: amountPages
    });
  }
}
