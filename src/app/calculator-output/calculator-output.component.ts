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
  differCalc: any;
  differCard: any;
  bldgPermit: number;
  reviewFee: number;
  elecPermit: number;
  tiers: Array<Tier>;

  constructor(private differs: KeyValueDiffers, private tiersService: TiersService, private calculationService: CalculationService) {
    this.differCalc = differs.find({}).create(null);
    this.differCard = differs.find({}).create(null);    
  }
  ngOnInit() { 
    this.calculations = new Calculations();
    this.calculations.valuation = 0;
    this.calculations.building = 0;
    this.calculations.electrical = new Fee("Electrical", 0, 1.01, 0.67);
    this.calculations.review = new Fee("Plan Review", 0, 0.55, 0.72);
    this.calculations.plumbing = new Fee("Plumbing", 0, 0.55, 0.22);
    this.calculations.mechanical = new Fee("Mechanical", 0, 0.78, 0.31); 
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
    this.calculations.valuation = valuation;
    this.sumBldgPermit();
  }
  sumBldgPermit() {
    let bldgPermit = 0;
    this.calculationService.calcBldgPermit(this.calculations.valuation, this.calculations.tiers).then(building => {
      this.calculations.building = building;
      this.calculationService.calcFees(this.calculations, this.cards, this.tiers).then(calculations => {
        this.calculations = calculations;
      });      
    });
  }
 
  ngDoCheck() {
    var card = this.cards[this.cardindex];
    var calcChanges = this.differCalc.diff(card.calculations);

    if (calcChanges) {
      calcChanges.forEachChangedItem(r => {
        console.log(r.key);
        if ((r.key === 'valuation') && r.currentValue != r.previousValue && r.currentValue > 0 && this.cardindex === card.cardindex) {
          this.calculations.isResidential = card.calculations.isResidential;
          this.sumValuation();            
        }                                                                 
      });
    }

  }
}
