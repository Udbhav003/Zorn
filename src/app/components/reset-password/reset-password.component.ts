import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUserFormData } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Colors } from 'src/app/shared/colors';
import { MustMatch } from 'src/app/shared/must-match.validator';
import { Helper } from 'src/app/utils/helper.util';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  public emailValidationForm: FormGroup;
  public resetPasswordForm: FormGroup;
  public userDetails: IUserFormData;

  public isEmailValidationFormSubmitted: boolean;
  public isResetPasswordFormSubmitted: boolean;
  public showPasswordEntries: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.emailValidationForm = {} as FormGroup;
    this.resetPasswordForm = {} as FormGroup;
    this.userDetails = {} as IUserFormData;
    this.isEmailValidationFormSubmitted = false;
    this.isResetPasswordFormSubmitted = false;
    this.showPasswordEntries = false;
  }

  public ngOnInit(): void {
    this.initEmailValidationForm();
  }

  public initEmailValidationForm(): void {
    this.emailValidationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  public initResetPasswordForm(): void {
    this.resetPasswordForm = this.formBuilder.group(
      {
        password: ['', [Validators.required]],
        cPassword: ['', [Validators.required]],
      },
      {
        validator: MustMatch('password', 'cPassword'),
      }
    );
  }

  get emailValidationFormControls() {
    return this.emailValidationForm.controls;
  }

  get resetPasswordFormControls() {
    return this.resetPasswordForm.controls;
  }

  public onSubmitEmailValidation(): void {
    this.isEmailValidationFormSubmitted = true;
    if (this.emailValidationForm.valid) {
      this.authService
        .isUserRegistered(this.emailValidationForm.getRawValue())
        .subscribe((response) => {
          if (response.length > 0) {
            this.userDetails = response[0];
            this.initResetPasswordForm();
            this.showPasswordEntries = true;
          } else {
            Helper.displayAlert(
              'error',
              'Invalid User',
              true,
              'Close',
              Colors.ERROR,
              false,
              ''
            );
          }
        });
    }
  }

  public onSubmitResetPasswordForm(): void {
    this.isResetPasswordFormSubmitted = true;
    if (this.resetPasswordForm.valid) {
      this.userDetails.password = this.resetPasswordForm.getRawValue().password;
      this.userService
        .updateUser(this.userDetails.id.toString(), this.userDetails)
        .subscribe((response) => {
          if (response) {
            Helper.displayAlert(
              'success',
              'Password Updated',
              true,
              'Okay',
              Colors.SUCCESS,
              false,
              ''
            ).then((response: any) => {
              if (response.isConfirmed) {
                this.router.navigate(['/login']);
              }
            });
          }
        });
    }
  }
}
