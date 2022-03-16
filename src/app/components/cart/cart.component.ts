import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICartData } from 'src/app/models/cart.model';
import { IFoodData } from 'src/app/models/food.model';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { UserService } from 'src/app/services/user.service';
import { Colors } from 'src/app/shared/colors';
import { Helper } from 'src/app/utils/helper.util';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartData: IFoodData[];
  cart: ICartData;

  displayData: {
    feedId: number;
    quantity: number;
    totalPrice: number;
    food: IFoodData;
  }[];

  tax: number;
  subTotal: number;
  cartTotal: number;
  disableCheckOut: boolean;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private userService: UserService,
    private communicationService: CommunicationService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.cartData = [];
    this.cart = {} as ICartData;
    this.displayData = [];
    this.subTotal = 0;
    this.cartTotal = 0;
    this.tax = 0;
    this.disableCheckOut = true;
  }

  ngOnInit(): void {
    if (this.authService.currentUserValue == null) {
      this.router.navigate(['../login']);
    }
    this.fetchCartList();
    this.disableCheckoutIfAddressNotFound(
      this.authService.currentUserValue.id.toString()
    );
  }

  async fetchCartList() {
    this.cartService
      .getCartItems(this.authService.currentUserValue.id.toString())
      .subscribe((response) => {
        this.subTotal = 0;
        this.cartTotal = 0;
        this.tax = 0;
        this.displayData = [];
        if (
          response != null && response.length>0 &&
          response[0].items != null &&
          response[0].items.length > 0
        ) {
          this.cart = response[0];
          this.cartData = response[0].items;
          this.communicationService.setCartSize(response[0].items.length);
          for (let food of response[0].items) {
            let found = false;
            let index: number = 0;
            for (let i = 0; i < this.displayData.length; i++) {
              if (food.feedId === this.displayData[i].feedId) {
                found = true;
                index = i;
                break;
              }
            }
            if (found) {
              this.displayData[index].quantity += 1;
              this.displayData[index].totalPrice =
                food.cost * this.displayData[index].quantity;
            } else {
              this.displayData.push({
                feedId: food.feedId,
                quantity: 1,
                totalPrice: food.cost,
                food: food,
              });
            }
            this.subTotal += food.cost;
          }
          this.tax = Math.ceil((18 * this.subTotal) / 100);
          this.cartTotal = this.subTotal + this.tax;
        } else {
          this.communicationService.setCartSize(0);
          Helper.displayAlert(
            'warning',
            'Cart is Empty',
            true,
            'Go to home',
            Colors.WARNING,
            false,
            ''
          ).then((result: any) => {
            if (result.isConfirmed) {
              this.router.navigate(['../home'], {
                relativeTo: this.activatedRoute,
              });
            }
          });
        }
      });
  }

  public deleteItem(food: IFoodData) {
    let index = this.cartData.indexOf(food);
    if (index > -1) {
      this.cartData.splice(index, 1);
    }
    this.cartService
      .deleteCartItem(this.cart.id.toString(), this.cartData)
      .subscribe((response) => {
        this.fetchCartList();
      });
  }

  private disableCheckoutIfAddressNotFound(id: string) {
    this.userService.getUserData(id).subscribe((response) => {
      if (response.addresses != null && response.addresses.length > 0) {
        this.disableCheckOut = false;
      } else {
        this.disableCheckOut = true;
      }
    });
  }

  public navigateToFoodList() {
    this.router.navigate(['../home'], { relativeTo: this.activatedRoute });
  }

  public navigateToAddress() {
    this.router.navigate(['../settings/address'], {
      relativeTo: this.activatedRoute,
    });
  }

  public navigateToTracking() {
    Helper.isNextStep = true;
    this.router.navigate(['../tracking', this.cartTotal], {
      relativeTo: this.activatedRoute,
    });
  }

  public navigateToPaymentDetails() {
    this.router.navigate(['../settings/payment-details'], {
      relativeTo: this.activatedRoute,
    });
  }
}
