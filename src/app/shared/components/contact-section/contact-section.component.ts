import { Component } from '@angular/core';
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";
import {faPhone} from "@fortawesome/free-solid-svg-icons";
import {faFacebookF, faInstagram, faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-contact-section',
  imports: [
    FaIconComponent,
    TranslatePipe
  ],
  templateUrl: './contact-section.component.html',
  standalone: true,
  styleUrl: './contact-section.component.scss'
})
export class ContactSectionComponent {

    protected readonly faEnvelope = faEnvelope;
    protected readonly faPhone = faPhone;
    protected readonly faWhatsapp = faWhatsapp;
    protected readonly faInstagram = faInstagram;
    protected readonly faFacebookF = faFacebookF;
}
