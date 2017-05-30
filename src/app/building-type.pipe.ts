import { Pipe, PipeTransform } from '@angular/core';
import { Iccbvd } from './iccbvd';
@Pipe({
  name: 'buildingType'
})
export class BuildingTypePipe implements PipeTransform {

  transform(buildings: Array<Iccbvd>, construction: string): any {
    if (!construction) {
      return buildings;
    } else if ((construction != 'IIIB' && construction != 'VB')) {
      return buildings;
    }
    else {
      console.log(construction);
      let retVals = [];
      buildings.forEach(building => {
        if ((construction === 'IIIB' || construction === 'VB') && building.group.indexOf('I-2') === -1) {
          retVals.push(building);
        }
      });
      return retVals;
      
    }
  }
}
