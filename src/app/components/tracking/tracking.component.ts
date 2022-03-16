import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IOrderData } from 'src/app/models/order.model';
import { IPaymentMethodData } from 'src/app/models/pay-method.model';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { OrderService } from 'src/app/services/order.service';
import { UserService } from 'src/app/services/user.service';
import { Colors } from 'src/app/shared/colors';
import { ValidMonthYear } from 'src/app/shared/month-year.validator';
import { Helper } from 'src/app/utils/helper.util';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css'],
})
export class TrackingComponent implements OnInit, OnDestroy {
  @ViewChild('closebutton') closeButton: any;

  @ViewChild('openModal', { static: true }) openModal: any;

  creditCardSectionVisible: boolean;
  bankSectionVisible: boolean;
  qrSectionVisible: boolean;

  creditCardForm: FormGroup;
  bankForm: FormGroup;

  submitted = false;
  inAddMode: boolean;
  searchInputText: string;
  paymentDone: boolean;

  totalAmountToPay: number;

  currentUser: any;

  allPaymentMethods: IPaymentMethodData[];
  currentPaymentMethod: IPaymentMethodData;
  selectedPaymentIndex: number;

  orders: IOrderData[];

  backgroundColorArray: { background: string }[];
  monthsArray: number[];
  yearsArray: number[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private cartService: CartService,
    private orderService: OrderService,
    private communicationService: CommunicationService
  ) {
    this.creditCardForm = {} as FormGroup;
    this.bankForm = {} as FormGroup;
    this.allPaymentMethods = [];
    this.currentPaymentMethod = {} as IPaymentMethodData;
    this.selectedPaymentIndex = -1;
    this.inAddMode = false;
    this.searchInputText = '';
    this.paymentDone = false;
    this.totalAmountToPay = 0;

    this.orders = [];

    this.bankSectionVisible = true;
    this.creditCardSectionVisible = false;
    this.qrSectionVisible = false;
    this.monthsArray = [];
    this.yearsArray = [];

    if (this.authService.currentUserValue == null) {
      this.router.navigate(['/login']);
    }
    this.backgroundColorArray = [];
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params: any) => {
      let total = params.get('total') as number;

      if (total != null && total != 0) {
        this.totalAmountToPay = total as number;
        this.monthsArray = Array.from({ length: 12 }, (_, i) => i + 1);
        let currentYear = new Date().getFullYear();
        for (let i = 0; i < 10; i++) this.yearsArray.push(currentYear++);

        this.fetchPaymentDetails(this.currentUser.id.toString());

        this.openModal?.nativeElement.click();
      } else {
        //Get all orders
        this.paymentDone = true;
        this.fetchAllOrders();
      }

      this.creditCardForm = this.formBuilder.group(
        {
          fullName: ['', Validators.required],
          creditCardNo: [
            '',
            [Validators.required, Validators.pattern('^[0-9]{16,16}$')],
          ],
          month: ['', Validators.required],
          year: ['', Validators.required],
          cvv: ['', [Validators.required, Validators.pattern('^[1-9]{3,3}$')]],
        },
        {
          validator: ValidMonthYear('month', 'year'),
        }
      );

      this.bankForm = this.formBuilder.group({
        accountHolderName: ['', Validators.required],
        accountNo: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10,16}$')],
        ],
        bankName: ['', Validators.required],
      });
    });
  }

  ngOnDestroy(): void {
    this.closeButton?.nativeElement.click();
  }

  get f() {
    return this.creditCardForm.controls;
  }

  get bankFormControls() {
    return this.bankForm.controls;
  }

  private fetchAllOrders() {
    this.orderService
      .getAllOrders(this.currentUser.id.toString())
      .subscribe((response) => {
        if (response != null && response.length > 0) {
          this.orders = response.reverse();
        }
      });
  }

  private fetchPaymentDetails(id: string) {
    this.userService.getUserData(id).subscribe((response) => {
      if (
        response.paymentMethods != null &&
        response.paymentMethods.length > 0
      ) {
        this.inAddMode = false;
        this.allPaymentMethods = response.paymentMethods;
        this.currentPaymentMethod =
          response.paymentMethods[response.paymentMethods.length - 1];
        this.selectedPaymentIndex = response.paymentMethods.length - 1;

        this.creditCardForm.setValue(this.currentPaymentMethod);

        for (let i = 0; i < response.paymentMethods.length; i++) {
          this.backgroundColorArray.push({ background: this.getColor() });
        }

        this.creditCardForm.disable();
      } else {
        this.inAddMode = true;
        this.creditCardForm.reset();
        this.creditCardForm.enable();
        this.allPaymentMethods = [];
        this.selectedPaymentIndex = -1;
      }
    });
  }

  public selectCard(index: number) {
    this.selectedPaymentIndex = index;
    this.currentPaymentMethod = this.allPaymentMethods[index];
    this.creditCardForm.setValue(this.currentPaymentMethod);
  }

  private getColor() {
    return (
      'hsl(' +
      360 * Math.random() +
      ',' +
      (25 + 70 * Math.random()) +
      '%,' +
      (85 + 10 * Math.random()) +
      '%)'
    );
  }

  public onPaymentConfirmed() {
    this.submitted = true;

    if (this.bankSectionVisible) {
      if (this.bankForm.invalid) {
        return;
      }
      let modifiedPaymentObject = this.bankForm.getRawValue() as any;
      modifiedPaymentObject.paymentMethod = 'Account Transfer';
      this.createOrder(modifiedPaymentObject);
    } else if (this.creditCardSectionVisible) {
      if (this.creditCardForm.invalid) {
        return;
      }

      if (this.selectedPaymentIndex == -1) {
        //This condition is triggered when used had to fill the credit card details
        let paymentObject = this.creditCardForm.getRawValue();
        this.allPaymentMethods.push(paymentObject);
        this.userService
          .updatePaymentMethods(
            this.currentUser.id.toString(),
            this.allPaymentMethods
          )
          .subscribe(
            (response) => {
              if (response) {
                let modifiedPaymentObject = paymentObject as any;
                modifiedPaymentObject.paymentMethod = 'Credit Card';
                this.createOrder(modifiedPaymentObject);
              }
            },
            (error) => {
              console.log('Error while saving payment method!', error);
            }
          );
      } else {
        //This condition is triggered when used selected a previously added card
        let modifiedPaymentObject = this.allPaymentMethods[
          this.selectedPaymentIndex
        ] as any;
        modifiedPaymentObject.paymentMethod = 'Credit Card';
        this.createOrder(modifiedPaymentObject);
      }
    } else if (this.qrSectionVisible) {
      let paymentObject = {
        paymentMethod: 'QR',
        customerName:
          this.currentUser.firstName + ' ' + this.currentUser.lastName,
        customerEmail: this.currentUser.email,
      };
      this.createOrder(paymentObject);
    }
  }

  private createOrder(paymentObject: any) {
    this.userService
      .getUserData(this.currentUser.id.toString())
      .subscribe((response) => {
        if (response.addresses != null && response.addresses.length > 0) {
          let requestObject = {
            id: Math.floor(Math.random() * 999999),
            userId: this.currentUser.id,
            payment: paymentObject,
            address: response.addresses[response.addresses.length - 1],
            orderStatus: 'Placed',
            paymentStatus: 'Paid',
            orderTotal: this.totalAmountToPay,
            orderDateTime: new Date().toString(),
          } as IOrderData;

          this.orderService.createOrder(requestObject).subscribe((res) => {
            Helper.displayAlert(
              'success',
              'Order Placed Successfully',
              true,
              'View My Orders',
              Colors.SUCCESS,
              false,
              ''
            ).then((result: any) => {
              if (result.isConfirmed) {
                this.paymentDone = true;
                this.fetchAllOrders();
                this.closeButton.nativeElement.click();
              }
            });

            this.deleteCartItems();
          });
        } else {
          Helper.displayAlert(
            'error',
            'Please add an address',
            true,
            'Add Address',
            Colors.PRIMARY,
            false,
            ''
          );

          this.router.navigate(['../settings/address'], {
            relativeTo: this.activatedRoute,
          });
        }
      });
  }

  private deleteCartItems() {
    this.cartService
      .getCartItems(this.currentUser.id.toString())
      .subscribe((cart) => {
        if (cart != null && cart.length > 0) {
          this.cartService
            .deleteCartItems(cart[0].id.toString())
            .subscribe((deleted) => {
              if (deleted) this.communicationService.setCartSize(0);
            });
        }
      });
  }
  public makeCreditCardSectionVisible() {
    this.bankSectionVisible = false;
    this.creditCardSectionVisible = true;
    this.qrSectionVisible = false;
  }

  public makeQRSectionVisible() {
    this.bankSectionVisible = false;
    this.creditCardSectionVisible = false;
    this.qrSectionVisible = true;
  }

  public makeBankSectionVisible() {
    this.bankSectionVisible = true;
    this.creditCardSectionVisible = false;
    this.qrSectionVisible = false;
  }
}
