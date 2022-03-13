import { FormGroup } from '@angular/forms';

export function ValidMonthYear(monthControlName: string, yearControlName: string) {
  return (formGroup: FormGroup) => {
    const monthControl = formGroup.controls[monthControlName];
    const yearControl = formGroup.controls[yearControlName];

    if (!monthControl || !yearControl) {
      return null;
    }

    let currentMonth = new Date().getMonth()+1
    let currentYear = new Date().getFullYear()

    if (monthControl.value<=currentMonth && yearControl.value==currentYear) {
      monthControl.setErrors({ invalidMonth: true });
      return null;
    } else {
      monthControl.setErrors(null);
      return null;
    }
  };
}
