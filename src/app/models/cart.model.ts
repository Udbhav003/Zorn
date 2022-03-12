import { IFoodData } from './food.model';

export interface ICartData {
  id: number;
  userId: string;
  items: IFoodData[];
}
