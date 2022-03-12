import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUserFormData } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profileForm: FormGroup;
  loading = false;
  submitted = false;
  inEditMode: boolean
  currentUser: IUserFormData

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.profileForm = {} as FormGroup
    this.inEditMode = false
    if(this.authService.currentUserValue==null){
      this.router.navigate(['/login'])
    }
    this.currentUser = {} as IUserFormData
  }

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.profileForm.disable()
    this.fetchUserData(this.authService.currentUserValue.id.toString())
  }

  get f() {
    return this.profileForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      return;
    }
    this.loading = true;

      this.currentUser.firstName = this.profileForm.get('firstName')?.value
      this.currentUser.lastName = this.profileForm.get('lastName')?.value
      this.currentUser.email = this.profileForm.get('email')?.value
      this.currentUser.password = this.profileForm.get('password')?.value
    
    this.updateUserDetails(
      this.currentUser.id.toString(),
      this.currentUser
    );
  }

  private fetchUserData(id: string) {
    this.userService.getUserData(id).subscribe((response) => {
      if (response != null) {
        this.inEditMode = false;
        this.currentUser = response;

        let displayData = {
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          email: this.currentUser.email,
          password: this.currentUser.password
        }

        this.profileForm.setValue(displayData);

        this.profileForm.disable();
      } else {
        this.inEditMode = true;
        this.profileForm.enable();
      }
    });
  }

  private updateUserDetails(id: string, user: IUserFormData) {
    this.userService.updateUser(id, user).subscribe(
      (response) => {
        if (response) {
          this.loading = false;
          this.inEditMode = false;
          this.fetchUserData(id);
        }
      },
      (error) => {
        console.log('Error while saving user!', error);
      }
    );
  }

  public toggleEdit() {
    this.inEditMode = !this.inEditMode;

    if (this.inEditMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

}
