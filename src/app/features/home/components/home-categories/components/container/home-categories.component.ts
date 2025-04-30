import {Component, OnInit} from '@angular/core';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {HomeCategoriesRowComponent} from '../home-categories-row/home-categories-row.component';
import {HomeService} from '../../../../services/home.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {NgxSplideModule} from 'ngx-splide';
import {RouterLink} from '@angular/router';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';

@UntilDestroy()
@Component({
  selector: 'app-home-categories',
  imports: [
    TranslatePipe,
    NgStyle,
    NgForOf,
    NgIf,
    HomeCategoriesRowComponent,
    NgxSplideModule,
    RouterLink,
    FaIconComponent
  ],
  templateUrl: './home-categories.component.html',
  standalone: true,
  styleUrl: './home-categories.component.scss'
})
export class HomeCategoriesComponent implements OnInit {
  categories:any[] = [];
  categoryRows:any[] = [];

  currentLang!: string
  splideOptions = {
    perPage: 4,
    perMove: 1,
    gap: '1rem',
    autoplay: false,
    pagination: true,
    loop: true,
    breakpoints: {
      768: {
        perPage: 1,
      }
    }
  };

  rtlSplideOptions = {
    ...this.splideOptions,
    direction: "rtl" as "rtl"
  }

  constructor(private homeService: HomeService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
    })

    this.homeService.getCategoriesData()
      .pipe(
        untilDestroyed(this) // Pipe the untilDestroyed operator
      ).subscribe(data => {
      this.categories = data;
      console.log('Categories loaded:', this.categories);
      // Split the data into chunks of 2
      this.categoryRows = []; // Reset the rows array
      for (let i = 0; i < data.length; i += 2) {
        // Slice the original array and push the chunk (pair) into categoryRows
        this.categoryRows.push(data.slice(i, i + 2));
      }
      console.log('Category rows created:', this.categoryRows);
    });
  }

  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;
}
