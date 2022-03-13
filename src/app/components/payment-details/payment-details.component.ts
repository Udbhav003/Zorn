import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IPaymentMethodData } from 'src/app/models/pay-method.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ValidMonthYear } from 'src/app/shared/month-year.validator';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css'],
})
export class PaymentDetailsComponent implements OnInit {
  paymentForm: FormGroup;
  loading = false;
  submitted = false;
  inAddMode: boolean;
  currentUser: any;
  allPaymentMethods: IPaymentMethodData[];
  currentPaymentMethod: IPaymentMethodData;
  selectedPaymentIndex: number;
  backgroundColorArray: { background: string }[];
  monthsArray: number[];
  yearsArray: number[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.paymentForm = {} as FormGroup;
    this.allPaymentMethods = [];
    this.currentPaymentMethod = {} as IPaymentMethodData;
    this.selectedPaymentIndex = -1;
    this.inAddMode = false;

    this.monthsArray = [];
    this.yearsArray = [];
    if (this.authService.currentUserValue == null) {
      this.router.navigate(['/login']);
    }
    this.backgroundColorArray = [];
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.paymentForm = this.formBuilder.group(
      {
        fullName: ['', Validators.required],
        creditCardNo: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{16,16}$')],
        ],
        month: ['', Validators.required],
        year: ['', Validators.required],
        cvv: ['', [Validators.required, Validators.pattern('^[1-9]{3,3}$')]],
      },
      {
        validator: ValidMonthYear('month', 'year'),
      }
    );

    this.monthsArray = Array.from({ length: 12 }, (_, i) => i + 1);

    let currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) this.yearsArray.push(currentYear++);

    this.fetchPaymentDetails(this.currentUser.id.toString());
  }

  get f() {
    return this.paymentForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.paymentForm.invalid) {
      return;
    }
    this.loading = true;
    this.allPaymentMethods.push(this.paymentForm.getRawValue());
    this.updatePaymentMethods(
      this.currentUser.id.toString(),
      this.allPaymentMethods
    );
  }

  private fetchPaymentDetails(id: string) {
    this.userService.getUserData(id).subscribe((response) => {
      if (
        response.paymentMethods != null &&
        response.paymentMethods.length > 0
      ) {
        this.inAddMode = false;
        this.allPaymentMethods = response.paymentMethods;
        this.currentPaymentMethod =
          response.paymentMethods[response.paymentMethods.length - 1];
        this.selectedPaymentIndex = response.paymentMethods.length - 1;

        this.paymentForm.setValue(this.currentPaymentMethod);

        for (let i = 0; i < response.paymentMethods.length; i++) {
          this.backgroundColorArray.push({ background: this.getColor() });
        }

        this.paymentForm.disable();
      } else {
        this.inAddMode = true;
        this.paymentForm.reset();
        this.paymentForm.enable();
        this.allPaymentMethods = [];
        this.selectedPaymentIndex = -1;
      }
    });
  }

  private updatePaymentMethods(
    id: string,
    paymentMethods: IPaymentMethodData[]
  ) {
    this.userService.updatePaymentMethods(id, paymentMethods).subscribe(
      (response) => {
        if (response) {
          this.loading = false;
          this.inAddMode = false;
          this.fetchPaymentDetails(id);
          this.submitted = false;
        }
      },
      (error) => {
        console.log('Error while saving payment method!', error);
      }
    );
  }

  public selectCard(index: number) {
    this.selectedPaymentIndex = index;
    this.currentPaymentMethod = this.allPaymentMethods[index];
    this.paymentForm.setValue(this.currentPaymentMethod);
  }

  public toggleAdd() {
    this.inAddMode = !this.inAddMode;

    if (this.inAddMode) {
      this.paymentForm.reset();
      this.paymentForm.enable();
    } else {
      if (this.selectedPaymentIndex > -1) {
        this.paymentForm.setValue(
          this.allPaymentMethods[this.selectedPaymentIndex]
        );
      }
      this.paymentForm.disable();
    }
  }

  public deleteCurrentPaymentMethod() {
    if (this.selectedPaymentIndex > -1) {
      this.allPaymentMethods.splice(this.selectedPaymentIndex, 1);
    }
    this.userService
      .deletePaymentMethod(
        this.authService.currentUserValue.id.toString(),
        this.allPaymentMethods
      )
      .subscribe((response) => {
        if (response)
          this.fetchPaymentDetails(
            this.authService.currentUserValue.id.toString()
          );
      });
  }

  private getColor() {
    return (
      'hsl(' +
      360 * Math.random() +
      ',' +
      (25 + 70 * Math.random()) +
      '%,' +
      (85 + 10 * Math.random()) +
      '%)'
    );
  }
}
