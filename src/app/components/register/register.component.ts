import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUserFormData } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { MustMatch } from 'src/app/shared/must-match.validator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  public userForm: FormGroup;
  public userDetails: any;

  public isFormSubmitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.userForm = {} as FormGroup;
    this.userDetails = {};
    this.isFormSubmitted = false;
  }

  public ngOnInit(): void {
    this.initUserForm();
  }

  public initUserForm(): void {
    this.userForm = this.formBuilder.group(
      {
        firstName: [
          '',
          [Validators.required, Validators.pattern('^[a-z A-Z]+$')],
        ],
        lastName: [
          '',
          [Validators.required, Validators.pattern('^[a-z A-Z]+$')],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        cPassword: ['', [Validators.required]],
      },
      {
        validator: MustMatch('password', 'cPassword'),
      }
    );
  }

  get userFormControls() {
    return this.userForm.controls;
  }

  public onSubmit(): void {
    this.isFormSubmitted = true;
    if (this.userForm.valid) {
      this.authService
        .isUserRegistered(this.userForm.getRawValue())
        .subscribe((response) => {
          if (response.length > 0) {
            Swal.fire({
              position: 'top-end',
              icon: 'error',
              title: 'User already registered',
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            let user = this.userForm.getRawValue();
            user.id = Math.floor(Math.random() * 999999);
            this.authService.register(user).subscribe(
              (response: IUserFormData[]) => {
                if (response) {
                  Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Registration Successful',
                    showConfirmButton: false,
                    timer: 1500,
                  });
                  this.router.navigate(['/login']);
                }
              },
              (error) => {
                Swal.fire({
                  position: 'top-end',
                  icon: 'error',
                  title: 'Error Occurred',
                  showConfirmButton: false,
                  timer: 1500,
                });
              }
            );
          }
        });
    }
  }
}
