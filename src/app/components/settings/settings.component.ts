import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUserFormData } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.currentUserValue == null) {
      this.router.navigate(['/login']);
    }
    this.currentUser = {} as IUserFormData;
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe((response) => {
      this.currentUser = response;
    });
  }
}
