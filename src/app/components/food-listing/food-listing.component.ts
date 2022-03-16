import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IFoodData } from 'src/app/models/food.model';
import { ICartData } from 'src/app/models/cart.model';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { FoodService } from 'src/app/services/food.service';
import Swal from 'sweetalert2';
import { Helper } from 'src/app/utils/helper.util';
import { Colors } from 'src/app/shared/colors';
import { UserService } from 'src/app/services/user.service';
import { CommunicationService } from 'src/app/services/communication.service';

@Component({
  selector: 'app-food-listing',
  templateUrl: './food-listing.component.html',
  styleUrls: ['./food-listing.component.css'],
})
export class FoodListingComponent implements OnInit {
  foods: IFoodData[];
  cart: ICartData;
  cartData: IFoodData[];
  isNewRecord: boolean;
  searchInputText: string;

  constructor(
    private foodService: FoodService,
    private cartService: CartService,
    private authService: AuthService,
    private userService: UserService,
    private communicationService: CommunicationService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.foods = [];
    this.cartData = [];
    this.cart = {} as ICartData;
    this.isNewRecord = true;
    this.searchInputText = '';
  }

  ngOnInit(): void {
    if (this.authService.currentUserValue == null) {
      this.router.navigate(['/login']);
    }
    this.fetchFoodList();
    this.fetchCartList();
  }

  fetchFoodList() {
    this.foodService.getFoodList().subscribe((response) => {
      this.foods = response;
    });
  }

  fetchCartList() {
    this.cartService
      .getCartItems(this.authService.currentUserValue.id.toString())
      .subscribe((response) => {
        if (response != null && response.length > 0) {
          this.cart = response[0];
          this.cartData = response[0].items;
          this.communicationService.setCartSize(response[0].items.length);
          this.isNewRecord = false;
        } else {
          this.cart = {
            id: Math.floor(Math.random() * 999999),
            userId: this.authService.currentUserValue.id.toString(),
            items: [],
          };
          this.cartData = [];
          this.communicationService.setCartSize(0);
          this.isNewRecord = true;
        }
      });
  }

  public confirm(action: string, food: IFoodData) {
    if (action === 'cart') {
      Swal.fire({
        text: 'Add ' + food.dishName + ' to Cart?',
        html:
          "<div class='card' style='border-radius=10px;'><a><img class='card-img-top' src='" +
          food.imageUrl +
          "' alt='Card image cap'/></a><h5 class='card-title mt-3 mb-3'>Add " +
          food.dishName +
          ' to Cart?</h5></div>',
        showCancelButton: true,
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster',
        },
        confirmButtonText: 'Add to Cart',
        confirmButtonColor: Colors.SUCCESS,
        cancelButtonColor: Colors.ERROR,
      }).then((result) => {
        if (result.isConfirmed) {
          this.addItemToCart(food);
        }
      });
    } else {
      Swal.fire({
        html:
          "<div class='card' style='border-radius=10px;'><a><img class='card-img-top' src='" +
          food.imageUrl +
          "' alt='Card image cap'/></a><h5 class='card-title mt-3 mb-3'>Place Order for " +
          food.dishName +
          '?</h5></div>',
        showCancelButton: true,
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster',
        },
        confirmButtonText: 'Place Order',
        confirmButtonColor: Colors.SUCCESS,
        cancelButtonColor: Colors.ERROR,
      }).then((result) => {
        if (result.isConfirmed) {
          //Place Order
          this.placeOrder(food.cost);
        }
      });
    }
  }

  private addItemToCart(food: IFoodData) {
    food.id = Math.floor(Math.random() * 999999);
    this.cartData.push(food);

    if (this.isNewRecord) {
      this.cart.items = this.cartData;
      this.cartService.createCart(this.cart).subscribe((response) => {
        this.fetchCartList();
        if (response) {
          Helper.displayAlert(
            'success',
            'Item added to Cart',
            true,
            'Go to Cart',
            Colors.SUCCESS,
            true,
            'Cancel'
          ).then((result: any) => {
            if (result.isConfirmed) {
              this.router.navigate(['../cart'], {
                relativeTo: this.activatedRoute,
              });
            }
          });
        } else {
          Helper.displayAlert(
            'error',
            'Failed to add Item!',
            true,
            'Okay',
            Colors.ERROR,
            false,
            ''
          );
        }
      });
    } else {
      this.cartService
        .addItemToCart(this.cart.id.toString(), this.cartData)
        .subscribe((response) => {
          this.fetchCartList();
          if (response) {
            Helper.displayAlert(
              'success',
              'Item added to Cart',
              true,
              'Go to Cart',
              Colors.SUCCESS,
              true,
              'Cancel'
            ).then((result: any) => {
              if (result.isConfirmed) {
                this.router.navigate(['../cart'], {
                  relativeTo: this.activatedRoute,
                });
              }
            });
          } else {
            Helper.displayAlert(
              'error',
              'Failed to add Item!',
              true,
              'Okay',
              Colors.ERROR,
              false,
              ''
            );
          }
        });
    }
  }

  private placeOrder(cost: number) {
    this.userService
      .getUserData(this.authService.currentUserValue.id.toString())
      .subscribe((response) => {
        if (response.addresses != null && response.addresses.length > 0) {
          Helper.isNextStep = true;
          this.router.navigate(['../tracking', cost], {
            relativeTo: this.activatedRoute,
          });
        } else {
          Helper.displayAlert(
            'error',
            'Please add an address',
            true,
            'Add Address',
            Colors.WARNING,
            false,
            ''
          ).then((response: any) => {
            if (response.isConfirmed) {
              this.router.navigate(['../settings/address']);
            }
          });
        }
      });
  }
}
