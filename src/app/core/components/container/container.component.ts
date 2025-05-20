import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {NavbarComponent} from '../navbar/navbar.component';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {filter, Observable} from 'rxjs';
import {MatProgressBar} from '@angular/material/progress-bar';
import {CartService} from '../../services/cart.service';
import {MatDrawer, MatDrawerContainer, MatSidenavModule} from '@angular/material/sidenav';
import {SideCartComponent} from '../../../features/cart/components/side-cart/side-cart.component';
import {FavoritesApiService} from '../../services/favorites-api.service';

@Component({
  selector: 'app-container',
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent,
    NavbarComponent,
    MatSidenavModule,
    MatProgressBar,
    MatDrawerContainer,
    MatDrawer,
    SideCartComponent
  ],
  templateUrl: './container.component.html',
  standalone: true,
  styleUrl: './container.component.scss'
})
export class ContainerComponent implements OnInit{
  isLoading = false;
  // Example value for determinate mode (0-100)
  loadingProgress = 50;
  isCartDrawerOpen$!: Observable<boolean>;
  private isBrowser: boolean;

  constructor(private router: Router,
              private cartService: CartService,
              private favoriteService: FavoritesApiService,
              @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.isCartDrawerOpen$ = this.cartService.drawerOpen$;
    this.router.events.pipe(
      // Filter for the relevant navigation events
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
        // Reset progress if using determinate (though usually indeterminate is better for resolvers)
        this.loadingProgress = 0;
      } else if (event instanceof NavigationEnd) {
        this.isLoading = false;
        // Scroll to top on navigation complete
        if (this.isBrowser) {
          setTimeout(() => {
            const scrollableContent = document.querySelector('.mat-drawer-content');
            if (scrollableContent) {
              scrollableContent.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 0); // 0ms or a slightly higher value like 50-100ms if needed
        }
      } else {
        // NavigationCancel, NavigationError
        this.isLoading = false;
      }
    });
  }

  ngOnInit() {
    this.favoriteService.loadFavorites();
  }

  cartDrawerClosed(): void {
    this.cartService.closeDrawer();
  }
}
