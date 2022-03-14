import { IAddressData } from "./address.model";

export interface IOrderData {
    id: number;
    userId: string;
    address: IAddressData;
    payment: any;
    orderStatus: string;
    paymentStatus: string,
    orderDateTime: string
  }