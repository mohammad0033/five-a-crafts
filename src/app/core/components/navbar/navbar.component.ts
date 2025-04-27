import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowRight, faSearch, faShoppingBag} from '@fortawesome/free-solid-svg-icons';
import {faHeart, faUser} from '@fortawesome/free-regular-svg-icons';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {BreakpointObserver} from "@angular/cdk/layout";
import {map} from "rxjs";

@UntilDestroy()
@Component({
  selector: 'app-navbar',
    imports: [
        FaIconComponent,
        TranslatePipe,
        RouterLink,
        RouterLinkActive
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

    constructor(
        private breakpointObserver: BreakpointObserver,
        @Inject(PLATFORM_ID) private platformId: Object,
        private cdRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Only run BreakpointObserver in the browser
        if (isPlatformBrowser(this.platformId)) {
            this.breakpointObserver
                .observe([this.desktopBreakpoint])
                .pipe(
                    map(result => result.matches), // Get the boolean value directly
                    untilDestroyed(this) // Use untilDestroyed operator
                )
                .subscribe(matches => {
                    this.isDesktop = matches;
                    this.cdRef.markForCheck(); // Trigger change detection when the value updates
                });
        } else {
            // Default behavior for SSR/prerendering
            this.isDesktop = false;
        }
    }
}
