import { Component, OnInit, Input, DoCheck, KeyValueDiffers} from '@angular/core';
import { DevelopmentCard } from '../development-card';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';  
@Component({
  selector: 'calcuator-output',
  inputs: ['cards', 'cardindex'],
  templateUrl: './calcuator-output.component.html',
  styleUrls: ['./calcuator-output.component.css']
})
export class CalcuatorOutputComponent implements OnInit, Input, DoCheck {

  cards: Array<DevelopmentCard>;
  cardindex: number;
  @Input() card: DevelopmentCard;
  valuation: number;
  differ: any;
  constructor(private differs: KeyValueDiffers) {
    this.differ = differs.find({}).create(null);
  }
  ngOnInit() {
    this.valuation = 0;
  }

  sumValuation() {

    let valuation = 0;
    this.cards.forEach(function (card) { 
      valuation += card.valuation;
    });
    this.valuation = 0;
    this.valuation = valuation;
  }

  ngDoCheck() {

    //this.cards.forEach(function (card) {
      var card = this.cards[this.cardindex];
		  var changes = this.differ.diff(card);
      if (changes) {
        			changes.forEachChangedItem(r => {
                if (r.key === 'valuation' && r.currentValue != r.previousValue && this.cardindex === card.cardindex) {
                  this.sumValuation();                    
                }
              });

			//changes.forEachAddedItem(r => console.log('added ' + r.currentValue));
		//	changes.forEachRemovedItem(r => console.log('removed ' + r.currentValue));
      }
   // });
  }


}
