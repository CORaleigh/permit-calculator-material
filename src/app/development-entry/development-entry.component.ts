import { Component, OnInit } from '@angular/core';
import { Observable }        from 'rxjs/Observable';

import { IccbvdService } from '../iccbvd.service';
import { Iccbvd } from '../iccbvd';
import { CalculationService } from '../calculation.service';
import { DevelopmentCard } from '../development-card';
@Component({
  selector: 'development-entry',
  templateUrl: './development-entry.component.html',
  styleUrls: ['./development-entry.component.css'],
  providers: [IccbvdService, CalculationService]
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
  constructor(private iccbvdService: IccbvdService, private calculationService: CalculationService) { }

  ngOnInit() {
    this.cardIndex = 0;
    let devcard = new DevelopmentCard();
    devcard.cardindex = 0;
    devcard.building = {group: "", values: []};    
    devcard.construction = {key: "", value: 0};
    this.cards = [devcard];
    this.selectedBuilding = {values:[]};
    this.selectedConstruction = {value: 0};
    this.scopes = [{name: 'New Contruction', percent: 1}, {name: 'Level 1 Alteration', percent: 0.25}, {name: 'Level 2 Alteration', percent: 0.5}, {name: 'Level 3 Alteration', percent: 0.75}];
    this.getIccbvd();
    

  }
 calcValuation(value: any) {
    this.calculationService.calcValuation(this.cards[this.cardIndex]).then(
      valuation => this.cards[this.cardIndex].valuation = valuation
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

  addCard() {
    let devcard = new DevelopmentCard();
    
    devcard.building = {group: "", values: []};
    devcard.construction = {key: "", value: 0};
    devcard.cardindex = this.cardIndex += 1
    this.cards.push(devcard);
   // this.cardIndex += 1;
  }
  getPreviousCard() {
    this.cardIndex -= 1;
  }
  getNextCard() {
    this.cardIndex += 1;
  }
}
