import { Pipe, PipeTransform } from '@angular/core';
import { IFoodData } from '../models/food.model';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(value: any, filterString: string, targetClass: string): any {
    if (value.length === 0 || filterString === '') {
      return value;
    }
    const result = [];

    if (targetClass === 'foods') {
      for (const item of value) {
        if (
          item.dishName
            .toLocaleLowerCase()
            .match(filterString.toLocaleLowerCase())
        ) {
          result.push(item);
        }
      }
    } else if (targetClass === 'orders') {
      for (const item of value) {
        if (item.id.toString().match(filterString)) {
          result.push(item);
        }
      }
    }

    return result;
  }
}
