import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressComponent } from './components/address/address.component';
import { CartComponent } from './components/cart/cart.component';
import { FoodListingComponent } from './components/food-listing/food-listing.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { PaymentDetailsComponent } from './components/payment-details/payment-details.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        component: FoodListingComponent,
      },
      {
        path: 'cart',
        component: CartComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'profile',
          },
          {
            path: 'profile',
            component: ProfileComponent,
          },
          {
            path: 'address',
            component: AddressComponent,
          },
          {
            path: 'payment-details',
            component: PaymentDetailsComponent,
          },
        ],
      },
    ],
  },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
