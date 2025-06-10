import {Component, OnInit} from '@angular/core';
import {ProfileService} from '../../services/profile.service';
import {Observable} from 'rxjs';
import {UserAddress} from '../../models/user-address';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {UserAddressCardComponent} from '../user-address-card/user-address-card.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MatDialog} from '@angular/material/dialog';
import {AddressFormComponent} from '../address-form/address-form.component';

@Component({
  selector: 'app-user-addresses',
  imports: [
    AsyncPipe,
    UserAddressCardComponent,
    NgForOf,
    TranslatePipe,
    NgIf
  ],
  templateUrl: './user-addresses.component.html',
  standalone: true,
  styleUrl: './user-addresses.component.scss'
})
export class UserAddressesComponent implements OnInit {
  addresses$! : Observable<UserAddress[]>

  constructor(private profileService: ProfileService,
              public dialog: MatDialog) {
    this.addresses$ = this.profileService.getUserAddresses()
  }

  ngOnInit() {
    console.log(this.addresses$);
  }

  addAddress() {
    console.log('Opening add address dialog...');
    this.dialog.open(AddressFormComponent,{
      width: '400px'
    })
  }

  editAddress(address: UserAddress) {
    console.log('Opening edit dialog for address:', address);
    const dialogRef = this.dialog.open(AddressFormComponent, { // Or EditAddressDialogComponent
      width: '400px', // Or your preferred width
      data: { ...address } // Pass a copy of the address data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // result will be the updated address data if saved
        console.log('Dialog result (updated address):', result);
        // Call your service to update the address on the backend
        // this.profileService.updateUserAddress(result.id, result).subscribe(...)
        // You'll likely want to refresh the addresses list or update it locally
      } else {
        console.log('Edit dialog was closed without saving');
      }
    });
  }

  deleteAddress(address: UserAddress) {
    console.log('Deleting address:', address);
    // this.profileService.deleteUserAddress(address);
  }
}
