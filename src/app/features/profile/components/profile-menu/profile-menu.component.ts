import { Component } from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faUser} from '@fortawesome/free-regular-svg-icons';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {faMapLocationDot, faShoppingBag} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile-menu',
  imports: [
    FaIconComponent,
    TranslatePipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './profile-menu.component.html',
  standalone: true,
  styleUrl: './profile-menu.component.scss'
})
export class ProfileMenuComponent {

  protected readonly faUser = faUser;
  protected readonly faShoppingBag = faShoppingBag;
  protected readonly faMapLocationDot = faMapLocationDot;
}
