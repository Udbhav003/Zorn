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
              position: 'center',
              icon: 'error',
              showClass: {
                popup: 'animate__animated animate__fadeInUp animate__faster',
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOutDown animate__faster',
              },
              title: 'User already registered',
              showConfirmButton: true,
              confirmButtonText: 'Close',
            });
          } else {
            let user = this.userForm.getRawValue();

            let requestData = {
              id: Math.floor(Math.random() * 999999),
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              password: user.password,
            };

            this.authService.register(requestData).subscribe(
              (response: IUserFormData[]) => {
                if (response) {
                  Swal.fire({
                    position: 'center',
                    icon: 'success',
                    showClass: {
                      popup:
                        'animate__animated animate__fadeInUp animate__faster',
                    },
                    hideClass: {
                      popup:
                        'animate__animated animate__fadeOutDown animate__faster',
                    },
                    title: 'Registration Successful',
                    showConfirmButton: true,
                    confirmButtonText: 'Go to Login',
                  });
                  this.router.navigate(['/login']);
                }
              },
              (error) => {
                Swal.fire({
                  position: 'center',
                  icon: 'error',
                  showClass: {
                    popup:
                      'animate__animated animate__fadeInUp animate__faster',
                  },
                  hideClass: {
                    popup:
                      'animate__animated animate__fadeOutDown animate__faster',
                  },
                  title: 'Error Occurred',
                  showConfirmButton: true,
                  confirmButtonText: 'Close',
                });
              }
            );
          }
        });
    }
  }
}
