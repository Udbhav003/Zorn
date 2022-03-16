import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { Helper } from 'src/app/utils/helper.util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  itemsInCart: boolean;
  cartSize: number;

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private cartService: CartService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.itemsInCart = false;
    this.cartSize = 0;
  }

  ngOnInit(): void {
    if (this.authService.currentUserValue == null) {
      this.router.navigate(['./login'], {
        relativeTo: this.activatedRoute,
      });
    }
    this.communicationService.currentCartSize.subscribe((response) => {
      if (response > 0) {
        this.cartSize = response;
        this.itemsInCart = true;
      } else {
        this.itemsInCart = false;
      }
    });
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
