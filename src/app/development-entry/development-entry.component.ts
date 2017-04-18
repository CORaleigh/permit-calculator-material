import { Component, OnInit } from '@angular/core';
import { Observable }        from 'rxjs/Observable';

import { IccbvdService } from '../iccbvd.service';
import { Iccbvd } from '../iccbvd';
import { CalculationService } from '../calculation.service';
import { DevelopmentCard } from '../development-card';
import { TiersService } from '../tiers.service';
import { Tier } from '../tier';
import { Calculations } from '../calculations';
@Component({
  selector: 'development-entry',
  templateUrl: './development-entry.component.html',
  styleUrls: ['./development-entry.component.css'],
  providers: [IccbvdService, CalculationService, TiersService]
})
export class DevelopmentEntryComponent implements OnInit {
  selectedBuilding: any;
  selectedConstruction: any;
  scopes: Array<any>;
  iccbvd: Iccbvd[];
  selectedIccbvd: Iccbvd;
  constructions: Array<string>;
  valuation: number;
  cards: Array<DevelopmentCard>;
  cardIndex: number;
  tiers: Array<Tier>;
  calculations: Calculations;
  constructor(private iccbvdService: IccbvdService, private calculationService: CalculationService, private tiersService: TiersService) { }

  ngOnInit() {
    this.cardIndex = 0;
    this.calculations = new Calculations();
    let devcard = new DevelopmentCard();
    devcard.cardindex = 0;
    devcard.building = {group: "", values: []};    
    devcard.construction = {key: "", value: 0};
    devcard.calculations = new Calculations();
    this.cards = [devcard];
    this.selectedBuilding = {values:[]};
    this.selectedConstruction = {value: 0};
    this.scopes = [{name: 'New Contruction', percent: 1}, {name: 'Level 1 Alteration', percent: 0.25}, {name: 'Level 2 Alteration', percent: 0.5}, {name: 'Level 3 Alteration', percent: 0.75}];
    this.getIccbvd();
    this.getTiers();
    

  }

  calcTotalPermit(card: DevelopmentCard) {
    this.calculationService.calcTotalPermit(card).then(
        fee => {card.calculations.totPermit = fee;
        }
    );
  }
  calcMechPermit(card: DevelopmentCard) {
      this.calculationService.calcMechPermit(card).then(
          fee => {card.calculations.mechPermit = fee;
          this.calcTotalPermit(card);

          }
      );
  }
  calcPlumPermit(card: DevelopmentCard) {
      this.calculationService.calcPlumPermit(card).then(
          fee => {card.calculations.plumPermit = fee;
          this.calcMechPermit(card);

          }
      );
  }
  calcElecPermit(card: DevelopmentCard) {
      this.calculationService.calcElecPermit(card).then(
          fee => {card.calculations.elecPermit = fee;
          this.calcPlumPermit(card);

          }
      );
  }

  calcReviewFee(card: DevelopmentCard) {
      this.calculationService.calcReviewFee(card).then(
          fee => {card.calculations.reviewFee = fee;
            this.calcElecPermit(card);
          }
      );
  }

  calcBldgPermit(card: DevelopmentCard) {
    if (this.tiers) {
      this.calculationService.calcBldgPermit(card, this.tiers).then(
          bldgPermit => {card.calculations.bldgPermit = bldgPermit;
          this.calcReviewFee(card);
          
          }
      );
    }

  }
 calcValuation(value: any, card: DevelopmentCard) {
    this.calculationService.calcValuation(card).then(
      valuation => {
        card.calculations.valuation = valuation;
        this.calcBldgPermit(card);
    }
    );

  }
  getIccbvd() {
    this.iccbvdService.getIccBvd().subscribe(
      iccbvd => this.iccbvd = iccbvd,
      err => {
        console.log(err);
      }, 
      () => {
        
      }
    );
  }

  getTiers() {
    this.tiersService.getTiers().subscribe(
      tiers => this.tiers = tiers,
      err => {
        console.log(err);
      }
    );
  }
  

  addCard() {
    let devcard = new DevelopmentCard();
    
    devcard.building = {group: "", values: []};
    devcard.construction = {key: "", value: 0};
    devcard.cardindex = this.cardIndex += 1;
    devcard.calculations = new Calculations();
    this.cards.push(devcard);
   // this.cardIndex += 1;
  }
  removeCard(cards: Array<DevelopmentCard>, index: number) {
    let card = cards[this.cardIndex];

    cards.splice(index, 1);
    this.cardIndex -= 1;
    this.calculationService.sumTotalPermit(this.cards).then(sum => this.calculations.totPermit = sum);

  }  
  getPreviousCard() {
    this.cardIndex -= 1;
  }
  getNextCard() {
    this.cardIndex += 1;
  }

  buildingTypeChanged(card:DevelopmentCard) {
    let key = card.construction.key;
    let timeoutId = setTimeout(() => {  
      card.building.values.forEach(function (type) {
        if (type.key === card.construction.key) {
          card.construction = type;
        }
      });
      this.calcValuation(card.construction.value, card);
    }, 100);

  }
}




