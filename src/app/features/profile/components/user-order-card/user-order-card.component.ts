import {Component, Input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {NgClass} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Order} from '../../models/order';

@Component({
  selector: 'app-user-order-card',
  imports: [
    TranslatePipe,
    NgClass,
    RouterLink
  ],
  templateUrl: './user-order-card.component.html',
  standalone: true,
  styleUrl: './user-order-card.component.scss'
})
export class UserOrderCardComponent {
  @Input() order!:Order

}
