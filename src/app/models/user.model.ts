import { IAddressData } from "./address.model";
import { IPaymentMethodData } from "./pay-method.model";

export interface IUserFormData {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    addresses: IAddressData[];
    paymentMethods: IPaymentMethodData[];
  }
  