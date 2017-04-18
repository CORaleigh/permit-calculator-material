import { Injectable } from '@angular/core';
import { DevelopmentCard } from './development-card';
import { Tier } from './tier';
@Injectable()
export class CalculationService {
  valuation: number;
  minFee: number = 106;
  percents: any = {building: {all: 0.00077944778071331, r3: 0.002616923}, plan: {all: 0.550907693344574, r3: 0.717419837103396}, elec: {all: 1.00793835113169, r3: 0.669736429687697}, plum: {all: 0.551694198410728, r3: 0.223647600095625}, mech: {all: 0.778591078767941, r3: 0.305407886978742}};
  constructor() { }

  calcValuation(card: DevelopmentCard): Promise<number>{
    let meansLocationFactor = 0.838137101;
    let valuation = 0;
    if (card.constructScope && card.squareFeet && card.construction) {
      valuation = meansLocationFactor * card.constructScope.percent * card.squareFeet * card.construction.value;
    }
    return Promise.resolve(valuation);
  }
  calcBldgPermit(card: DevelopmentCard, tiers: Array<Tier>): Promise<number> {
    let costper = 0;
    let bldgPermit = 0;
    var BreakException = {};
    if (card.calculations.valuation) {
      if (card.calculations.valuation > 0) { 
        if (card.building.group && card.construction.value) {
          if (card.building.group === 'R-3 Residential, one- and two-family') {
            card.calculations.bldgPermit = card.calculations.valuation * 0.00261692324298379 * 0.888226389234951;
          } else {
            let i = 0;
            let tier = null;
            for (; i < tiers.length; i++) {
              tier = tiers[i];
              if ((card.calculations.valuation > tier.min && card.calculations.valuation < tier.max) || !tier.max) {
                if (i === 0) {
                  bldgPermit = (card.calculations.valuation/1000) * tier['costper'];
                } else {
                  bldgPermit = (((card.calculations.valuation - tiers[i - 1]['max'])/1000) * tier['costper']) + tiers[i - 1]['cumulative'];
                }
                break;
              }
            }
          }
        }
        if (bldgPermit < this.minFee) {
          bldgPermit = this.minFee;
        } 
      } 
    }
    return Promise.resolve(bldgPermit);
  } 

  calcReviewFee(card:DevelopmentCard): Promise<number> {
    let fee = 0;
    let percent = 0;
    if (card.calculations.bldgPermit > 0) {
      percent = (card.building.group === 'R-3 Residential, one- and two-family') ? this.percents.plan.r3 : this.percents.plan.all;
      fee = card.calculations.bldgPermit * percent;
      if (fee < this.minFee) {
        fee = this.minFee;
      }
    }
    return Promise.resolve(fee);
  }
  calcElecPermit(card:DevelopmentCard): Promise<number> {
    let fee = 0;
    let percent = 0;
    if (card.calculations.bldgPermit > 0) {
      percent = (card.building.group === 'R-3 Residential, one- and two-family') ? this.percents.elec.r3 : this.percents.elec.all;
      fee = card.calculations.bldgPermit * percent;
      if (fee < this.minFee) {
        fee = this.minFee;
      }
    }
    return Promise.resolve(fee);
  }  
  calcPlumPermit(card:DevelopmentCard): Promise<number> {
    let fee = 0;
    let percent = 0;
    if (card.calculations.bldgPermit > 0) {
      percent = (card.building.group === 'R-3 Residential, one- and two-family') ? this.percents.plum.r3 : this.percents.plum.all;
      fee = card.calculations.bldgPermit * percent;
      if (fee < this.minFee) {
        fee = this.minFee;
      }   
    }
    return Promise.resolve(fee);
  }  
  calcMechPermit(card:DevelopmentCard): Promise<number> {
    let fee = 0;
    let percent = 0;
    if (card.calculations.bldgPermit > 0) {
      percent = (card.building.group === 'R-3 Residential, one- and two-family') ? this.percents.mech.r3 : this.percents.mech.all;
      fee = card.calculations.bldgPermit * percent;
      if (fee < this.minFee) {
        fee = this.minFee;
      }          
    }
    return Promise.resolve(fee);
  }     
  calcTotalPermit(card:DevelopmentCard): Promise<number> {
    let fee = card.calculations.bldgPermit + card.calculations.elecPermit + card.calculations.mechPermit + card.calculations.plumPermit + card.calculations.reviewFee;
    return Promise.resolve(fee);
  }
  sumTotalPermit(cards:Array<DevelopmentCard>): Promise<number> {
    let sum = 0;
    cards.forEach(function (card) { 
      sum += card.calculations.totPermit;
    }); 
    return Promise.resolve(sum);
  }    
}