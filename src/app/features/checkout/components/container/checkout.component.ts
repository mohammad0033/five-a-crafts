import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Meta, Title} from '@angular/platform-browser';
import {CartItem} from '../../../cart/models/cart-item';
import {CartService} from '../../../../core/services/cart.service';
import {Router} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';

@UntilDestroy()
@Component({
  selector: 'app-checkout',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatCheckboxModule,
    MatRadioModule,
    FaIconComponent,
    AsyncPipe,
    NgForOf
  ],
  templateUrl: './checkout.component.html',
  standalone: true,
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems$: Observable<CartItem[]>;
  subtotal$: Observable<number>;     // Will hold the subtotal before discount/shipping
  discount$: Observable<number>;     // From CartService
  shippingFee$: Observable<number>;  // From CartService
  totalAmount$: Observable<number>;   // This will be the final grand total from CartService
  currentLang!: string
  checkoutForm:FormGroup = new FormGroup({
    name: new FormControl('',[Validators.required]),
    company: new FormControl(''),
    address: new FormControl('',[Validators.required]),
    apartment: new FormControl(''),
    city: new FormControl('',[Validators.required]),
    governorate: new FormControl(''),
    phone: new FormControl('',[Validators.required]),
    email: new FormControl('',[Validators.required,Validators.email]),
    saveInfo: new FormControl(false), // Added for the checkbox
    paymentMethod: new FormControl('', [Validators.required]) // Added for payment method
  })
  isSubmitting: boolean = false

  private titleSubscription?: Subscription;

  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;

  constructor(
    private metaService: Meta,
    private titleService: Title,
    public cartService: CartService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.subtotal$ = this.cartService.subtotal$;         // Get subtotal from service
    this.discount$ = this.cartService.discount$;         // Get discount from service
    this.shippingFee$ = this.cartService.shippingFee$;   // Get shipping fee from service
    this.totalAmount$ = this.cartService.totalAmount$;   // Get final total amount from service
  }

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang
    this.setPageTitle();
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
      this.setPageTitle();
    });
  }

  private setPageTitle(): void {
    // Unsubscribe from previous subscription if it exists to avoid memory leaks
    this.titleSubscription?.unsubscribe();
    this.titleSubscription = this.translate.get('checkout.pageTitle').subscribe((pageTitle: string) => {
      this.titleService.setTitle(pageTitle);
    });
  }

  submitCheckout() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched(); // Mark fields to show errors
      Object.values(this.checkoutForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    console.log('Checkout Form Submitted:', this.checkoutForm.value);
    this.checkoutForm.disable()

    // Simulate API call for order placement
    // Replace with your actual order processing logic
    // setTimeout(() => {
    //   this.isSubmitting = false;
    //   console.log('Order placed (simulated)!');
    //   alert('Order placed successfully (simulated)!'); // Replace with actual success handling
    //   this.cartService.clearCart(); // Example: Clear cart after successful order
    //   this.router.navigate(['/']); // Example: Navigate to home or order success page
    // }, 2000);
  }

  ngOnDestroy() {
    this.metaService.removeTag("name='robots'");
    this.titleSubscription?.unsubscribe();
  }
}


// awesome work now that we are done with basic setup for that component, let's implement something advanced. first i will explain the projects build and structure. this is a standalone SSR angular project that uses SSR that comes from angular 19 since it is implemented into angular now and no need to use angular universal anumore. the project uses folder structure of core, features and shared.
