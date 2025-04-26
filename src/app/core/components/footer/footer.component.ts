import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faFacebook, faInstagram, faTwitter} from '@fortawesome/free-brands-svg-icons';
import {TranslateService} from '@ngx-translate/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [
    FaIconComponent,
    NgIf
  ],
  templateUrl: './footer.component.html',
  standalone: true,
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  protected readonly faInstagram = faInstagram;
  protected readonly faTwitter = faTwitter;
  protected readonly faFacebook = faFacebook;
  isHandset = false;

  constructor(private translateService: TranslateService,
              @Inject(PLATFORM_ID) private platformId: Object, private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }
}
