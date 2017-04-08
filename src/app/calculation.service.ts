import { Injectable } from '@angular/core';
import { DevelopmentCard } from './development-card';
@Injectable()
export class CalculationService {
  valuation: number;
  constructor() { }
  calcValuation(card: DevelopmentCard): Promise<number>{
    let meansLocationFactor = 0.838137101;
    let valuation = 0;
    if (card.constructScope && card.squareFeet && card.construction) {
      valuation = meansLocationFactor * card.constructScope.percent * card.squareFeet * card.construction.value;
    }

    return Promise.resolve(valuation);
  }
}
