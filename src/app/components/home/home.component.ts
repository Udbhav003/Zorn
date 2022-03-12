import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.currentUserValue == null) {
      this.router.navigate(['./login']);
    }
  }

  public logOut() {
    this.cartService
      .getCartItems(this.authService.currentUserValue.id.toString())
      .subscribe((cart) => {
        if (cart != null && cart.length > 0) {
          this.cartService
            .deleteCartItems(cart[0].id.toString())
            .subscribe((result) => {
              this.authService.logout();
              this.router.navigate(['./login'], {
                relativeTo: this.activatedRoute,
              });
            });
        } else {
          this.authService.logout();
          this.router.navigate(['./login'], {
            relativeTo: this.activatedRoute,
          });
        }
      });
  }
}
