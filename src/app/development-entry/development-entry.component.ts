import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Observable }        from 'rxjs/Observable';
import { IccbvdService } from '../iccbvd.service';
import { Iccbvd } from '../iccbvd';
import { CalculationService } from '../calculation.service';
import { DevelopmentCard } from '../development-card';
import { TiersService } from '../tiers.service';
import { Tier } from '../tier';
import { Calculations } from '../calculations';
import { Fee } from '../fee';

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
  @Input() isResidential: boolean;
  @Output() isResidentialUpdated = new EventEmitter<boolean>();
  constructor(private iccbvdService: IccbvdService, private calculationService: CalculationService, private tiersService: TiersService) { }
  ngOnInit() {
    this.cardIndex = 0;
    let devcard = new DevelopmentCard();
    devcard.cardindex = 0;
    devcard.building = {group: "", values: []};    
    devcard.construction = {key: "", value: 0};
    devcard.calculations = new Calculations();
    devcard.constructScope = {name:"", percent: 0};
    this.cards = [devcard];
    this.selectedBuilding = {values:[]};
    this.selectedConstruction = {value: 0};
    this.scopes = [{name: 'New Construction', percent: 1}, {name: 'Level 1 Alteration', percent: 0.25}, {name: 'Level 2 Alteration', percent: 0.5}, {name: 'Level 3 Alteration', percent: 0.75}];
    this.getIccbvd();
  }
  
 calcValuation(value: any, card: DevelopmentCard) {
    this.calculationService.calcValuation(card).then(
      valuation => {
        card.calculations.valuation = valuation;
      }
    );
  }
  getIccbvd() {
    this.iccbvdService.getIccBvd().subscribe(
      iccbvd => this.iccbvd = iccbvd,
      err => {
        console.log(err);
      }
    );
  }

  getBuildingTypes(buildings: Array<Iccbvd>, isResidential: boolean, numCards: number) : Array<Iccbvd>{
    let types = new Array<Iccbvd>();
    if (numCards <= 1) {
      types = buildings;
    } else {
      buildings.forEach(type => {
        if (isResidential && type.group.indexOf('R-3') > -1) {
          types.push(type);
        } else if (!isResidential && type.group.indexOf('R-3') < 0) {
          types.push(type);
        }
      });
    }
    return types;
  }

  addCard() {
    let devcard = new DevelopmentCard();
    devcard.building = {group: "", values: []};
    devcard.construction = {key: "", value: 0};
    devcard.cardindex = this.cards.length;
    devcard.calculations = new Calculations();
    this.cards.push(devcard);
    this.cardIndex = devcard.cardindex;
  }
  removeCard(cards: Array<DevelopmentCard>, index: number) {
    let card = cards[this.cardIndex];
    cards.splice(index, 1);
    this.cardIndex -= 1;
  }  

  getPreviousCard() {
    this.cardIndex -= 1;
  }

  getNextCard() {
    this.cardIndex += 1;
  }

  buildingTypeChanged(card:DevelopmentCard) {
    let key = card.construction.key;
    this.isResidential = false;
    if (card.building.group === "R-3 Residential, one- and two-family") {
      card.calculations.isResidential = true;
      this.isResidential = true;
    } else {
      card.calculations.isResidential = false;
    }
    this.isResidentialUpdated.emit(this.isResidential);
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




