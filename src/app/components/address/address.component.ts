import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IAddressData } from 'src/app/models/address.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
})
export class AddressComponent implements OnInit {
  addressForm: FormGroup;
  loading = false;
  submitted = false;
  inEditMode: boolean;
  currentUser: any;
  allAddresses: IAddressData[];
  currentAddress: IAddressData;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.addressForm = {} as FormGroup;
    this.allAddresses = [];
    this.currentAddress = {} as IAddressData;
    this.inEditMode = false;
    if (this.authService.currentUserValue == null) {
      this.router.navigate(['../login']);
    }
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.addressForm = this.formBuilder.group({
      houseNo: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      landmark: ['', Validators.required],
    });

    this.fetchAddressDetails(this.currentUser.id.toString());
  }

  get f() {
    return this.addressForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.addressForm.invalid) {
      return;
    }
    this.loading = true;
    this.allAddresses.push(this.addressForm.getRawValue());
    this.updateAddressDetails(
      this.currentUser.id.toString(),
      this.allAddresses
    );
  }

  private fetchAddressDetails(id: string) {
    this.userService.getUserData(id).subscribe((response) => {
      if (response.addresses != null && response.addresses.length > 0) {
        this.inEditMode = false;
        this.allAddresses = response.addresses;
        this.currentAddress = response.addresses[response.addresses.length - 1];

        this.addressForm.setValue(this.currentAddress);

        this.addressForm.disable();
      } else {
        this.inEditMode = true;
        this.addressForm.enable();
        this.allAddresses = [];
      }
    });
  }

  private updateAddressDetails(id: string, addresses: IAddressData[]) {
    this.userService.updateAddress(id, addresses).subscribe(
      (response) => {
        if (response) {
          this.loading = false;
          this.inEditMode = false;
          this.fetchAddressDetails(id);
        }
      },
      (error) => {
        console.log('Error while saving address!', error);
      }
    );
  }

  public toggleEdit() {
    this.inEditMode = !this.inEditMode;

    if (this.inEditMode) {
      this.addressForm.enable();
    } else {
      this.addressForm.disable();
    }
  }
}
