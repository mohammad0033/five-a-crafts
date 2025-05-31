import { FormGroup, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * A cross-field validator that checks if two form controls have matching values.
 * The error is set on the `matchingControlName` if they do not match.
 *
 * @param controlName The name of the primary control (e.g., 'password').
 * @param matchingControlName The name of the control to compare against (e.g., 'confirmPassword').
 * @returns A ValidatorFn.
 */
export function passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    if (!(formGroup instanceof FormGroup)) {
      // This validator is intended for FormGroups
      return null;
    }

    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (!control || !matchingControl) {
      // If controls are not found, don't validate
      return null;
    }

    // If a previous validator has already set an error on the matchingControl, do not overwrite it,
    // unless it's our own 'mustMatch' error (to allow re-validation).
    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      return null;
    }

    // Set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      // Clear only the 'mustMatch' error, preserving other potential errors.
      if (matchingControl.hasError('mustMatch') && matchingControl.errors) {
        delete matchingControl.errors['mustMatch'];
        if (Object.keys(matchingControl.errors).length === 0) {
          matchingControl.setErrors(null);
        }
      }
    }
    // This validator operates by setting errors on a child control,
    // so the FormGroup itself doesn't return an error from this validator.
    return null;
  };
}
