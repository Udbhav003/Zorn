import { Pipe, PipeTransform } from '@angular/core';
import { IFoodData } from '../models/food.model';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: IFoodData[], filterString: string): IFoodData[] {
    if(value.length === 0 || filterString === ""){
      return value;
    }
     const result = [];

    for (const item of value) {
      if(item.dishName.toLocaleLowerCase().match(filterString.toLocaleLowerCase())){
        result.push(item)
      }
    }

    return result;
  }

}
