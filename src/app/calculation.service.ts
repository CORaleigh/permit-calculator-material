import { Injectable } from '@angular/core';
import { DevelopmentCard } from './development-card';
import { Tier } from './tier';
import { Fee } from './fee';
import { Calculations } from './calculations';
@Injectable()
export class CalculationService {
  valuation: number;
  minFee: number = 106;
    constructor() { }

  calcValuation(card: DevelopmentCard): Promise<number>{
    let meansLocationFactor = 0.8381;//0.838137101;
    let valuation = 0;
    if (card.constructScope && card.squareFeet && card.construction) {
      valuation = meansLocationFactor * card.constructScope.percent * card.squareFeet * card.construction.value;
    }
    return Promise.resolve(valuation);
  }

  getFees(building: number, isResidential: boolean, fee: Fee): Fee{
    fee.value = 0;
    if (building > 0) {
      fee.value = building * fee.commercial;
      if (isResidential) {
        fee.value = building * fee.residential;
        if (fee.waive) {
          fee.value = 0;
        }
      }
      if ((fee.value < this.minFee || building <= this.minFee) && !fee.waive) {
        fee.value = this.minFee;
      }
    }
    return fee;
  }



  calcFees(calculations: Calculations): Promise<Calculations> {
    if (calculations.building > 0) {
      calculations.review = this.getFees(calculations.building, calculations.isResidential, calculations.review);
      calculations.electrical = this.getFees(calculations.building, calculations.isResidential, calculations.electrical);
      calculations.mechanical = this.getFees(calculations.building, calculations.isResidential, calculations.mechanical);
      calculations.plumbing = this.getFees(calculations.building, calculations.isResidential, calculations.plumbing);
    }
    return Promise.resolve(calculations);
  }

  calcBldgPermit(valuation: number, tiers: Array<Tier>): Promise<number> {
    let costper = 0;
    let bldgPermit = 0;
    var BreakException = {};
    if (valuation > 0) {
      let i = 0;
      let tier = null;
          for (; i < tiers.length; i++) {
            tier = tiers[i];
            if ((valuation > tier.min && valuation < tier.max) || !tier.max) {
              if (i === 0) {
                bldgPermit = (valuation/1000) * tier['costper'];
              } else {
                bldgPermit = (((valuation - tiers[i - 1]['max'])/1000) * tier['costper']) + tiers[i - 1]['cumulative'];
              }
              break;
            }
          }      
    }   
    if (bldgPermit < this.minFee) {
      bldgPermit = this.minFee;
    }  
    return Promise.resolve(bldgPermit);
  }
}