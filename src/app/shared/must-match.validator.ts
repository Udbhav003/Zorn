import { FormGroup } from '@angular/forms';

export function MustMatch(firstControlName: string, secondControlName: string) {
  return (formGroup: FormGroup) => {
    const firstControl = formGroup.controls[firstControlName];
    const secondControl = formGroup.controls[secondControlName];

    if (!firstControl || !secondControl) {
      return null;
    }

    if (secondControl.errors && !secondControl.errors['mustMatch']) {
      return null;
    }

    if (firstControl.value !== secondControl.value) {
      secondControl.setErrors({ mustMatch: true });
      return null;
    } else {
      secondControl.setErrors(null);
      return null;
    }
  };
}
