import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUserFormData } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

import swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public userForm: FormGroup;
  public userDetails: any;

  public isFormSubmitted: boolean;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {
    this.userForm = {} as FormGroup;
    this.userDetails = {};
    this.isFormSubmitted = false;
  }

  public ngOnInit(): void {
    this.initUserForm();
  }

  public initUserForm(): void {
    this.userForm = this.formBuilder.group({
      email: ['',[Validators.required, Validators.email]],
      password: ['',[Validators.required]],
    });
  }

  get userFormControls() {
    return this.userForm.controls;
  }

  public onSubmit(): void {
    this.isFormSubmitted = true;
    if(this.userForm.valid){
      this.authService.login(this.userForm.getRawValue()).subscribe(
        (response: IUserFormData)=>{
          if(response!=null){
            this.router.navigate(['/home']);
          }
          else{
            Swal.fire('Invalid Credentials', 'Please try again!', 'error')
          }
        }
      )
    }
  }

}
