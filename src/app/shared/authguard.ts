import { CanActivate } from '@angular/router/router';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable, NgZone } from '@angular/core';
import { Helper } from '../utils/helper.util';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public zone: NgZone, public router: Router) {}
  canActivate(): boolean {
    if (!Helper.isNextStep) {
      this.zone.run(() => {
        this.router.navigate(['']); //you can redirect user to any page here ( Optional )
      });
      return false; //block navigation
    } else {
      return Helper.isNextStep || true; // allow navigation
    }
  }
}
