import {Component, inject, OnInit} from '@angular/core';
import {NavbarComponent} from '../navbar/navbar.component';
import {FooterComponent} from '../footer/footer.component';
import {TranslateModule} from '@ngx-translate/core';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {filter, take} from 'rxjs';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-loading',
  imports: [
    NavbarComponent,
    FooterComponent,
    TranslateModule
  ],
  templateUrl: './loading.component.html',
  standalone: true,
  styleUrl: './loading.component.scss'
})
export class LoadingComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // console.log('LoadingComponent: ngOnInit. Current auth state sync:', this.authService.isAuthenticated());
    this.authService.isAuthenticated$.pipe(
      untilDestroyed(this),
      filter(isAuthenticated => isAuthenticated !== null),
      take(1)
    ).subscribe(isAuthenticated => {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      // console.log(`LoadingComponent: Auth state resolved to ${isAuthenticated}. Navigating.`);

      if (isAuthenticated) {
        if (returnUrl === '/loading' || returnUrl === '/') {
          // console.log(`LoadingComponent: Authenticated, returnUrl is trivial, navigating to /`);
          this.router.navigate(['/']);
        } else {
          // console.log(`LoadingComponent: Authenticated, navigating to returnUrl: ${returnUrl}`);
          this.router.navigateByUrl(returnUrl);
        }
      } else {
        // console.log(`LoadingComponent: Not authenticated, navigating to /`);
        this.router.navigate(['/']);
      }
    });
  }
}
