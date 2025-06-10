import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {UserWidgetComponent} from '../user-widget/user-widget.component';
import {ProfileMenuComponent} from '../profile-menu/profile-menu.component';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../../../core/services/auth.service';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faSignOut} from '@fortawesome/free-solid-svg-icons';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ProfileService} from '../../services/profile.service';
import {ProfileResolvedData} from '../../resolvers/profile.resolver';
import {map} from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-profile',
  imports: [
    UserWidgetComponent,
    ProfileMenuComponent,
    RouterOutlet,
    TranslatePipe,
    FaIconComponent
  ],
  templateUrl: './profile.component.html',
  standalone: true,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  userImage = ''
  userName = ''
  userPhone = ''

  constructor(
    private metaService: Meta,
    private titleService: Title, // Optional: Inject Title if needed
    private authService: AuthService,
    private route: ActivatedRoute, // For resolver data
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Profile | Five A Crafts');
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    // 1. Load initial data from resolver into ProfileService
    this.route.data.pipe(
      untilDestroyed(this),
      map(data => data['profilePageData'] as ProfileResolvedData)
    ).subscribe(resolvedData => {
      if (resolvedData && resolvedData.userInfo) {
        console.log('ProfileComponent: UserInfo found in resolved data:', resolvedData.userInfo);
        let userInfo = Array.isArray(resolvedData.userInfo) ? resolvedData.userInfo : [resolvedData.userInfo];
        this.profileService.loadInitialUserInfo(userInfo);
      } else {
        this.profileService.loadInitialUserInfo(null); // Or handle error/fallback
        console.warn('ProfileComponent: UserInfo not found in resolved data.');
      }
    });

    // 2. Subscribe to userInfo$ from ProfileService to update local properties
    this.profileService.userInfo$.pipe(untilDestroyed(this)).subscribe(userInfo => {
      if (userInfo) {
        this.userName = userInfo.name || '';
        this.userPhone = userInfo.phone_number || '';
        this.userImage = userInfo.image_url || ''; // Adjust if image_url is named differently
        console.log('ProfileComponent updated from ProfileService:', userInfo);
      } else {
        // Handle case where userInfo becomes null (e.g., after logout if service resets it)
        this.userName = '';
        this.userPhone = '';
        this.userImage = '';
      }
    });
  }

  ngOnDestroy(): void {
    // It's good practice to remove or reset the robots tag when leaving the component
    // This prevents it from potentially persisting if navigation logic changes later.
    this.metaService.removeTag("name='robots'");
  }

  logout() {
    this.authService.logout().pipe(untilDestroyed(this)).subscribe(() => {
      // Optionally reset user info in ProfileService on logout
      this.profileService.loadInitialUserInfo(null);
    });
  }

  protected readonly faSignOut = faSignOut;
}
