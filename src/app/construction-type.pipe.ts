import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'constructionType'
})
export class ConstructionTypePipe implements PipeTransform {

  transform(values: any, args?: any): any {
    let retVals = [];
    values.forEach(value => {
      if (value.value > 0) {
        retVals.push(value);
      }
    });
    return retVals;
  }

}
