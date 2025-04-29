import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgClass, NgForOf, NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faArrowRight, faSearch, faShoppingBag} from '@fortawesome/free-solid-svg-icons';
import {faHeart, faUser} from '@fortawesome/free-regular-svg-icons';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {BreakpointObserver} from "@angular/cdk/layout";
import {map} from "rxjs";
import {ContentService, MegaMenuData} from '../../services/content.service';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  imports: [
    FaIconComponent,
    TranslatePipe,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgForOf,
    NgbDropdownModule,
    NgClass
  ],
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrl: './navbar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush // Good practice with async pipes/observables
})
export class NavbarComponent implements OnInit{
  protected readonly faUser = faUser;
  protected readonly faSearch = faSearch;
  protected readonly faHeart = faHeart;
  protected readonly faShoppingBag = faShoppingBag;
  protected readonly faArrowRight = faArrowRight;
  // Screen size tracking
  isDesktop: boolean = false;
  private readonly desktopBreakpoint = '(min-width: 768px)';
  // Property to hold the mega menu data
  megaMenuColumns: MegaMenuData | null = null;
  currentLang!: string;

    constructor(
        private breakpointObserver: BreakpointObserver,
        @Inject(PLATFORM_ID) private platformId: Object,
        private cdRef: ChangeDetectorRef,
        private contentService: ContentService, // Inject ContentService
        private translate: TranslateService) {}

    ngOnInit(): void {
      this.trackScreenSize();
      this.loadMegaMenuData();

      this.currentLang = this.translate.currentLang

      this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event) => {
        this.currentLang = event.lang
      })
    }

  private trackScreenSize(): void {
    // Only run BreakpointObserver in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.breakpointObserver
        .observe([this.desktopBreakpoint])
        .pipe(
          map(result => result.matches), // Get the boolean value directly
          untilDestroyed(this) // Auto-unsubscribe when component is destroyed
        )
        .subscribe(matches => {
          this.isDesktop = matches;
          this.cdRef.markForCheck(); // Trigger change detection for OnPush
        });
    } else {
      // Default server-side behavior (or handle differently if needed)
      this.isDesktop = false; // Or true, depending on desired SSR default
    }
  }

  private loadMegaMenuData(): void {
    this.contentService.getMegaMenuData()
      .pipe(
        untilDestroyed(this) // Auto-unsubscribe when component is destroyed
      )
      .subscribe({
        next: (data) => {
          this.megaMenuColumns = data;
          this.cdRef.markForCheck(); // Trigger change detection for OnPush
        },
        error: (error) => {
          console.error('Error loading mega menu data:', error);
        }
      });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    console.log(lang);
  }

  protected readonly faArrowLeft = faArrowLeft;
}
