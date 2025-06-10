import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UserAddress} from '../../models/user-address';
import {NgIf} from '@angular/common';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-user-address-card',
  imports: [
    MatIcon,
    MatMenu,
    MatIconButton,
    MatMenuItem,
    TranslatePipe,
    MatMenuTrigger,
    NgIf
  ],
  templateUrl: './user-address-card.component.html',
  standalone: true,
  styleUrl: './user-address-card.component.scss'
})
export class UserAddressCardComponent {
  @Input () address!:UserAddress
  @Output() editAddress = new EventEmitter<UserAddress>()
  @Output() deleteAddress = new EventEmitter<UserAddress>()
  protected readonly faEdit = faEdit;

  handleEditAddress(address:UserAddress) {
    this.editAddress.emit(address);
  }

  handleDeleteAddress(address:UserAddress) {
    this.deleteAddress.emit(address);
  }
}
