import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IFoodData } from 'src/app/models/food.model';
import { ICartData } from 'src/app/models/cart.model';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { FoodService } from 'src/app/services/food.service';
import Swal from 'sweetalert2';

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

  constructor(
    private foodService: FoodService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.foods = [];
    this.cartData = [];
    this.cart = {} as ICartData;
    this.isNewRecord = true;
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
          this.isNewRecord = false;
        } else {
          this.cart = {
            id: Math.floor(Math.random() * 999999),
            userId: this.authService.currentUserValue.id.toString(),
            items: [],
          };
          this.cartData = [];
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
        confirmButtonText: 'Add to Cart',
        confirmButtonColor: '#2d6a4f',
        cancelButtonColor: '#d33',
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
        confirmButtonText: 'Place Order',
        confirmButtonColor: '#2d6a4f',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          //Place Order
          console.log('Placing Order : ', food);
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
          this.displayMessage(
            'C',
            'Item added to Cart',
            'success',
            'Go to Cart',
            true
          );
        } else {
          this.displayMessage(
            'E',
            'Failed to add Item!',
            'error',
            'Okay',
            false
          );
        }
      });
    } else {
      this.cartService
        .addItemToCart(this.cart.id.toString(), this.cartData)
        .subscribe((response) => {
          this.fetchCartList();
          if (response) {
            this.displayMessage(
              'C',
              'Item added to Cart',
              'success',
              'Go to Cart',
              true
            );
          } else {
            this.displayMessage(
              'E',
              'Failed to add Item!',
              'error',
              'Okay',
              false
            );
          }
        });
    }
  }

  private displayMessage(
    action: string,
    msg: string,
    status: any,
    confirmText: string,
    showCancelButton: boolean
  ) {
    Swal.fire({
      text: msg,
      icon: status,
      showCancelButton: showCancelButton,
      showConfirmButton: true,
      confirmButtonText: confirmText,
      confirmButtonColor: '#2d6a4f',
    }).then((result) => {
      if (result.isConfirmed) {
        if (action === 'C') {
          this.router.navigate(['../cart'], {
            relativeTo: this.activatedRoute,
          });
        }
      }
    });
  }
}
