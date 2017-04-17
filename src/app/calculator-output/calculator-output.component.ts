import { Component, OnInit, Input, DoCheck, KeyValueDiffers} from '@angular/core';
import { DevelopmentCard } from '../development-card';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';  
import { Calculations } from '../calculations';
import { TiersService } from '../tiers.service';
import { Tier } from '../tier';
import { CalculationService} from '../calculation.service';
@Component({
  selector: 'calculator-output',
  inputs: ['cards', 'cardindex', 'calculations'],
  templateUrl: './calculator-output.component.html',
  styleUrls: ['./calculator-output.component.css'],
  providers: [TiersService, CalculationService]
})
export class CalculatorOutputComponent implements OnInit, Input, DoCheck {
  calculations: Calculations;
  cards: Array<DevelopmentCard>;
  cardindex: number;
  @Input() card: DevelopmentCard;
  differ: any;
  bldgPermit: number;
  reviewFee: number;
  elecPermit: number;
  tiers: Array<Tier>;

  constructor(private differs: KeyValueDiffers, private tiersService: TiersService, private calculationService: CalculationService) {
    this.differ = differs.find({}).create(null);
  }
  ngOnInit() {
   // this.valuation = 0;
    //this.calculations = new Calculations();

  
  }


  sumValuation() {
    let valuation = 0;
    this.cards.forEach(function (card) { 
      valuation += card.calculations.valuation;
    });
    this.calculations.valuation = 0;
    this.calculations.valuation = valuation;
  }

  sumBldgPermit() {
    let bldgPermit = 0;
    this.cards.forEach(function (card) { 
      bldgPermit += card.calculations.bldgPermit;
    });
    this.calculations.bldgPermit = 0;
    this.calculations.bldgPermit = bldgPermit;
  }
  sumReviewFee() {
    let reviewFee = 0;
    this.cards.forEach(function (card) { 
      reviewFee += card.calculations.reviewFee;
    });
    this.calculations.reviewFee = 0;
    this.calculations.reviewFee = reviewFee;
  }

  sumElecPermit() {
    let elecPermit = 0;
    this.cards.forEach(function (card) { 
      elecPermit += card.calculations.elecPermit;
    });
    this.calculations.elecPermit = 0;
    this.calculations.elecPermit = elecPermit;
  }  
  sumPlumPermit() {
    let plumPermit = 0;
    this.cards.forEach(function (card) { 
      plumPermit += card.calculations.plumPermit;
    });
    this.calculations.plumPermit = 0;
    this.calculations.plumPermit = plumPermit;
  }    
  sumMechPermit() {
    let mechPermit = 0;
    this.cards.forEach(function (card) { 
      mechPermit += card.calculations.mechPermit;
    });
    this.calculations.mechPermit = 0;
    this.calculations.mechPermit = mechPermit;
  }
  sumTotPermit() {
    let totPermit = 0;
    this.cards.forEach(function (card) { 
      totPermit += card.calculations.totPermit;
    });
    this.calculations.totPermit = 0;
    this.calculations.totPermit = totPermit;
  }    
  ngDoCheck() {

    //this.cards.forEach(function (card) {
      var card = this.cards[this.cardindex];
		  var changes = this.differ.diff(card.calculations);
      if (changes) {
        			changes.forEachChangedItem(r => {
                
                if (r.key === 'valuation' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
                  this.sumValuation();                    
                }
                if (r.key === 'bldgPermit' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
                  this.sumBldgPermit();                    
                }    
                if (r.key === 'reviewFee' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
                  this.sumReviewFee();                    
                }           
                if (r.key === 'elecPermit' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
                  this.sumElecPermit();                    
                }    
                if (r.key === 'plumPermit' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
                  this.sumPlumPermit();                    
                }
                if (r.key === 'mechPermit' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
                  this.sumMechPermit();                    
                }
                if (r.key === 'totPermit' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
                 // this.sumTotPermit();;
                  this.calculationService.sumTotalPermit(this.cards).then(sum => this.calculations.totPermit = sum);
                }                                                                    
              });

          // var cards = this.cards;
          // var changes = this.differ.diff(cards);
          // if (changes) {
          //   changes.forEachRemovedItem(r => console.log('removed ' + r.currentValue));
          // }        
			//changes.forEachAddedItem(r => console.log('added ' + r.currentValue));
		//	changes.forEachRemovedItem(r => console.log('removed ' + r.currentValue));
      }


   // });
  }


}
