import { Component, OnInit, Input, DoCheck, KeyValueDiffers} from '@angular/core';
import { DevelopmentCard } from '../development-card';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';  
import { Calculations } from '../calculations';
import { TiersService } from '../tiers.service';
import { Tier } from '../tier';
import { CalculationService} from '../calculation.service';
import { Fee } from '../fee';
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
    this.calculations = new Calculations();
    this.calculations.valuation = 0;
    this.calculations.building = 0;
    this.calculations.electrical = new Fee(0, 1.01, 0.67);
    this.calculations.review = new Fee(0, 0.55, 0.72);
    this.calculations.plumbing = new Fee(0, 0.55, 0.22);
    this.calculations.mechanical = new Fee(0, 0.78, 0.31); 
    this.getTiers();  
  }

  getTiers() {
    this.tiersService.getTiers().subscribe(
      tiers => {this.tiers = tiers; this.calculations.tiers = tiers;},
      err => {
        console.log(err);
      }
    );
  }


  sumValuation() {
    let valuation = 0;
    this.cards.forEach(function (card) { 
      valuation += card.calculations.valuation;
    });
    //this.calculations.valuation = 0;
    this.calculations.valuation = valuation;
    this.sumBldgPermit();
  }
  sumBldgPermit() {
    let bldgPermit = 0;
    this.calculationService.calcBldgPermit(this.calculations.valuation, this.calculations.tiers).then(building => {
      this.calculations.building = building;
      this.calculationService.calcFees(this.calculations).then(calculations => {
        this.calculations = calculations;
      });      
    });
  }
 
  ngDoCheck() {
      var card = this.cards[this.cardindex];
		  var changes = this.differ.diff(card.calculations);
      if (changes) {
        changes.forEachChangedItem(r => {
          if (r.key === 'valuation' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
            this.calculations.isResidential = card.calculations.isResidential;
            this.sumValuation();            
          }                                                                 
        });
    }
  }
}
