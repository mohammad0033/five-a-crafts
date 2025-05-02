import { Component } from '@angular/core';
import {faArrowLeft, faArrowRight, faPhone} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {NgForOf, NgIf, SlicePipe} from '@angular/common';
import {ProductCardComponent} from '../../../../shared/components/product-card/product-card.component';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {faEnvelope} from '@fortawesome/free-regular-svg-icons';
import {faFacebookF, faInstagram, faWhatsapp} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-home-contact',
  imports: [
    FaIconComponent,
    TranslatePipe
  ],
  templateUrl: './home-contact.component.html',
  standalone: true,
  styleUrl: './home-contact.component.scss'
})
export class HomeContactComponent {

  protected readonly faArrowLeft = faArrowLeft;
  protected readonly faArrowRight = faArrowRight;
  protected readonly faEnvelope = faEnvelope;
  protected readonly faPhone = faPhone;
  protected readonly faInstagram = faInstagram;
  protected readonly faWhatsapp = faWhatsapp;
  protected readonly faFacebookF = faFacebookF;
}
