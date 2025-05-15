import {Component, OnInit} from '@angular/core';
import {UserOrderCardComponent} from '../user-order-card/user-order-card.component';
import {NgForOf, NgIf} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {ProfileService} from '../../services/profile.service';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {finalize} from 'rxjs';
import {Order} from '../../models/order';
import {ProfileResolvedData} from '../../resolvers/profile.resolver';
import {ActivatedRoute} from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-user-orders',
  imports: [
    UserOrderCardComponent,
    NgForOf,
    NgIf,
    TranslatePipe
  ],
  templateUrl: './user-orders.component.html',
  standalone: true,
  styleUrl: './user-orders.component.scss'
})
export class UserOrdersComponent implements OnInit {

  orders: Order[] = []
  isLoading: boolean = false;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.isLoading = true;

    this.route.parent?.data.pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      untilDestroyed(this)
    ).subscribe(data => {
      const resolvedData = data['profilePageData'] as ProfileResolvedData;
      if (resolvedData && resolvedData.orders) {
        this.orders = resolvedData.orders;
        // ...
        this.isLoading = false; // Data is pre-loaded
      } else {
        // Handle case where orders might be null due to resolver error
        this.isLoading = false;
      }
    });
  }
}
