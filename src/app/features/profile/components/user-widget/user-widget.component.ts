import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faUser} from '@fortawesome/free-regular-svg-icons';
// import {TranslatePipe} from '@ngx-translate/core';
// import {faEdit} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-widget',
  imports: [
    NgIf,
    FaIconComponent,
    // TranslatePipe
  ],
  templateUrl: './user-widget.component.html',
  standalone: true,
  styleUrl: './user-widget.component.scss'
})
export class UserWidgetComponent {
  @Input() image!:string
  @Input() name!:string
  @Input() phone!:string
  protected readonly faUser = faUser;
  // protected readonly faEdit = faEdit;
}
