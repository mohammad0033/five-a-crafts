import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {UserWidgetComponent} from '../user-widget/user-widget.component';
import {ProfileMenuComponent} from '../profile-menu/profile-menu.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    UserWidgetComponent,
    ProfileMenuComponent,
    RouterOutlet
  ],
  templateUrl: './profile.component.html',
  standalone: true,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  userImage = 'https://picsum.photos/id/1062/300/300'
  userName = 'John Doe'
  userPhone = '+1 (123) 456-7890'

  constructor(
    private metaService: Meta,
    private titleService: Title // Optional: Inject Title if needed
  ) {}

  ngOnInit(): void {
    // Optional: Explicitly set title if route title isn't reliable enough
    // this.titleService.setTitle('Your Cart | Five A Crafts');

    // Add noindex tag to prevent search engine indexing
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    // ... other component initialization logic ...
  }

  ngOnDestroy(): void {
    // It's good practice to remove or reset the robots tag when leaving the component
    // This prevents it from potentially persisting if navigation logic changes later.
    this.metaService.removeTag("name='robots'");
  }
}
