import { Component } from '@angular/core';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule} from '@angular/router';
import {FooterComponent} from '../footer/footer.component';
import {NavbarComponent} from '../navbar/navbar.component';
import {CommonModule} from '@angular/common';
import {filter} from 'rxjs';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'app-container',
  imports: [CommonModule, RouterModule, FooterComponent, NavbarComponent, MatProgressBar],
  templateUrl: './container.component.html',
  standalone: true,
  styleUrl: './container.component.scss'
})
export class ContainerComponent {
  isLoading = false;
  // Example value for determinate mode (0-100)
  loadingProgress = 50;

  constructor(private router: Router) {
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
}
