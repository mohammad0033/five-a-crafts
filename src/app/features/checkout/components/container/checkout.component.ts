import {Component, OnDestroy, OnInit} from '@angular/core';
import {finalize, Observable, Subscription, timer} from 'rxjs';
import {Meta, Title} from '@angular/platform-browser';
import {CartItem} from '../../../cart/models/cart-item';
import {CartService} from '../../../../core/services/cart.service';
import {Router} from '@angular/router';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {AsyncPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {AuthDialogComponent} from '../../../../shared/components/auth-dialog/auth-dialog.component';
import {AuthService} from '../../../../core/services/auth.service';
import {MatButtonModule} from '@angular/material/button';
import {CheckoutPiiData, PiiService} from '../../../../core/services/pii.service';

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
    NgForOf,
    MatDialogModule, // Add MatDialogModule
    MatButtonModule,
    NgClass
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
  promoCodeControl = new FormControl('');
  isSubmitting: boolean = false;
  isApplyingPromoCode: boolean = false;
  isPiiLoading: boolean = false;
  promoCodeMessage: string | null = null;
  promoCodeMessageType: 'success' | 'error' | null = null;
  promoCodeAppliedAmount: number = 0; // Store the amount of the currently applied promo

  private titleSubscription?: Subscription;

  protected readonly faArrowRight = faArrowRight;
  protected readonly faArrowLeft = faArrowLeft;

  constructor(
    private metaService: Meta,
    private titleService: Title,
    public cartService: CartService,
    private router: Router,
    private translate: TranslateService,
    private dialog: MatDialog,
    private authService: AuthService,
    private piiService: PiiService
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

    // Attempt to load PII if user is already logged in
    if (this.authService.getIsLoggedIn()) {
      this.loadSavedPii();
    }

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe((event: any) => {
      this.currentLang = event.lang
      this.setPageTitle();
    });

    // Listen for login status changes to load/clear PII from form
    this.authService.isLoggedIn$.pipe(untilDestroyed(this)).subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadSavedPii(); // User just logged in
      } else {
        // User logged out, clear PII from form and uncheck saveInfo
        this.checkoutForm.patchValue({
          name: '', company: '', address: '', apartment: '',
          city: '', governorate: '', phone: '', email: '',
          saveInfo: false
        });
      }
    });

    // Subscribe to promoDiscount$ to update local state if it changes elsewhere or on init
    this.cartService.promoDiscount$.pipe(untilDestroyed(this)).subscribe(promoAmount => {
      this.promoCodeAppliedAmount = promoAmount;
      if (promoAmount > 0) {
        this.promoCodeMessage = this.translate.instant('checkout.promoCodeAppliedSuccess'); // Generic message
        this.promoCodeMessageType = 'success';
        this.promoCodeControl.disable();
        // If you stored the actual code, you could set it here: this.promoCodeControl.setValue(actualAppliedCode);
      } else {
        // If promoAmount is 0, means it was cleared or never applied
        if (this.promoCodeControl.disabled) { // Only re-enable if it was previously disabled by a promo
          this.promoCodeControl.enable();
        }
        // Don't clear message if it's an error message from a failed attempt
        if (this.promoCodeMessageType === 'success') {
          this.promoCodeMessage = null;
          this.promoCodeMessageType = null;
        }
      }
    });
  }

  private loadSavedPii(): void {
    this.isPiiLoading = true;
    this.piiService.loadPii().pipe(
      finalize(() => this.isPiiLoading = false),
      untilDestroyed(this)
    ).subscribe(savedPii => {
      if (savedPii) {
        this.checkoutForm.patchValue({
          ...savedPii, // Spread the PII data
          saveInfo: true // If PII is loaded, "saveInfo" was effectively true
        });
        console.log('CheckoutComponent: PII loaded into form from mock PiiService.');
      } else {
        // Ensure saveInfo is false if no PII is loaded, especially after a logout then login
        this.checkoutForm.patchValue({ saveInfo: false });
        console.log('CheckoutComponent: No PII loaded from mock PiiService.');
      }
    });
  }

  private setPageTitle(): void {
    // Unsubscribe from previous subscription if it exists to avoid memory leaks
    this.titleSubscription?.unsubscribe();
    this.titleSubscription = this.translate.get('checkout.pageTitle').subscribe((pageTitle: string) => {
      this.titleService.setTitle(pageTitle);
    });
  }

  applyPromoCode(): void {
    const code = this.promoCodeControl.value?.trim();
    if (!code) {
      this.promoCodeMessage = this.translate.instant('checkout.promoCodeInvalid');
      this.promoCodeMessageType = 'error';
      return;
    }

    // If a promo is already applied, prevent applying another one for this simple setup
    // Or, you could clear the old one first: this.cartService.clearPromoCodeDiscount();
    if (this.promoCodeAppliedAmount > 0) {
      // Optionally inform the user that a code is already applied
      // For now, the button should be disabled if promoCodeAppliedAmount > 0 due to promoCodeControl.disabled
      return;
    }


    this.isApplyingPromoCode = true;
    this.promoCodeMessage = null;
    this.promoCodeMessageType = null;
    this.promoCodeControl.disable(); // Disable while applying

    timer(1500)
      .pipe(
        finalize(() => {
          this.isApplyingPromoCode = false;
          // Re-enable control ONLY if no code was successfully applied AND it's not already disabled by promoCodeAppliedAmount > 0
          if (this.promoCodeAppliedAmount === 0) {
            this.promoCodeControl.enable();
          }
        })
      )
      .subscribe(() => {
        const promoValue = 40; // The value of our successful promo code
        if (code.toUpperCase() === 'EXPIRED') {
          this.promoCodeMessage = this.translate.instant('checkout.promoCodeExpired');
          this.promoCodeMessageType = 'error';
        } else if (code.toUpperCase() === 'INVALID') {
          this.promoCodeMessage = this.translate.instant('checkout.promoCodeInvalid');
          this.promoCodeMessageType = 'error';
        } else if (code.toUpperCase() === 'SAVE40') {
          this.cartService.applyPromoCodeDiscount(promoValue);
          // The subscription in ngOnInit to cartService.promoDiscount$ will handle UI updates for success
          // this.promoCodeMessage = this.translate.instant('checkout.promoCodeAppliedSuccess');
          // this.promoCodeMessageType = 'success';
          // this.promoCodeAppliedAmount = promoValue; // This will be set by the subscription
          // this.promoCodeControl.disable(); // This will be handled by the subscription
        } else {
          this.promoCodeMessage = this.translate.instant('checkout.promoCodeUnknown');
          this.promoCodeMessageType = 'error';
        }
      });
  }

  submitCheckout(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      Object.values(this.checkoutForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    if (this.authService.getIsLoggedIn()) {
      this._proceedWithOrderPlacement();
    } else {
      const dialogRef = this.dialog.open(AuthDialogComponent, {
        width: '400px',
        disableClose: true // User must interact with the dialog
      });

      dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(result => {
        if (result === true) { // User "logged in" or "registered"
          this._proceedWithOrderPlacement();
        } else {
          // User cancelled the dialog, do nothing or provide feedback
          console.log('Authentication cancelled by user.');
          this.isSubmitting = false; // Ensure isSubmitting is reset if it was set
        }
      });
    }
  }

  private _proceedWithOrderPlacement(): void {
    this.isSubmitting = true;
    const formValue = this.checkoutForm.value;

    // PII Saving/Clearing Logic using PiiService
    if (this.authService.getIsLoggedIn()) {
      if (formValue.saveInfo) {
        const piiToSave: CheckoutPiiData = {
          name: formValue.name,
          company: formValue.company,
          address: formValue.address,
          apartment: formValue.apartment,
          city: formValue.city,
          governorate: formValue.governorate,
          phone: formValue.phone,
          email: formValue.email
        };
        this.piiService.savePii(piiToSave).pipe(untilDestroyed(this)).subscribe(response => {
          console.log('PII Save (mock) response:', response.message);
        });
      } else {
        // If saveInfo is unchecked, clear any PII "on the server" for this user
        this.piiService.clearPii().pipe(untilDestroyed(this)).subscribe(response => {
          console.log('PII Clear (mock) response:', response.message);
        });
      }
    } else {
      console.log('CheckoutComponent: User not logged in, PII not managed with PiiService.');
    }

    console.log('Checkout Form Submitted:', formValue);
    this.checkoutForm.disable();

    setTimeout(() => {
      this.isSubmitting = false;
      alert(this.translate.instant('checkout.orderPlacedSuccess'));
      this.cartService.clearCart();

      this.checkoutForm.enable();
      // Determine if PII should be reloaded or form fully reset
      const userIsLoggedIn = this.authService.getIsLoggedIn();
      const shouldSaveInfo = formValue.saveInfo;

      if (userIsLoggedIn && shouldSaveInfo) {
        // PII was saved, form will be repopulated by loadSavedPii if still logged in
        // or on next login. For now, just reset the form but keep saveInfo checked.
        this.checkoutForm.reset({ ...formValue, saveInfo: true }); // Keep current values, ensure saveInfo is true
        this.loadSavedPii(); // Explicitly reload to ensure form reflects "saved" state
      } else {
        // Clear form completely, including unchecking saveInfo
        this.checkoutForm.reset({
          name: '', company: '', address: '', apartment: '',
          city: '', governorate: '', phone: '', email: '',
          saveInfo: false, paymentMethod: '' // Also reset paymentMethod
        });
      }

      this.promoCodeControl.enable();
      this.promoCodeControl.reset();
      this.promoCodeMessage = null;
      this.promoCodeMessageType = null;

      this.router.navigate(['/']);
    }, 2000);
  }

  ngOnDestroy() {
    this.metaService.removeTag("name='robots'");
    this.titleSubscription?.unsubscribe();
  }
}
