import { Component } from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {NavbarComponent} from '../navbar/navbar.component';
import {CommonModule} from '@angular/common';
import {filter, Observable} from 'rxjs';
import {MatProgressBar} from '@angular/material/progress-bar';
import {CartService} from '../../services/cart.service';
import {MatDrawer, MatDrawerContainer, MatSidenavModule} from '@angular/material/sidenav';
import {SideCartComponent} from '../../../features/cart/components/side-cart/side-cart.component';

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
export class ContainerComponent {
  isLoading = false;
  // Example value for determinate mode (0-100)
  loadingProgress = 50;
  isCartDrawerOpen$!: Observable<boolean>;

  constructor(private router: Router,
              private cartService: CartService) {
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
      } else {
        // NavigationEnd, NavigationCancel, NavigationError
        this.isLoading = false;
      }
    });
  }

  cartDrawerClosed(): void {
    this.cartService.closeDrawer();
  }
}
