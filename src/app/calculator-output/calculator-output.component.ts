import { Component, OnInit, Input, DoCheck, KeyValueDiffers, OnDestroy, HostListener} from '@angular/core';
import { DevelopmentCard } from '../development-card';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';  
import { Calculations } from '../calculations';
import { TiersService } from '../tiers.service';
import { Tier } from '../tier';
import { CalculationService} from '../calculation.service';
import { Fee } from '../fee';
import { CanDeactivate } from '@angular/router';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
declare let ga: Function;
@Component({
  selector: 'calculator-output',
  inputs: ['cards', 'cardindex', 'calculations'],
  templateUrl: './calculator-output.component.html',
  styleUrls: ['./calculator-output.component.css'],
  providers: [TiersService, CalculationService]
})

export class CalculatorOutputComponent implements OnInit, DoCheck {

  calculations: Calculations;
  cards: Array<DevelopmentCard>;
  cardindex: number;
  @Input() card: DevelopmentCard;
  differ: any;
  cardDiffer: any;
  bldgPermit: number;
  reviewFee: number;
  elecPermit: number;
  tiers: Array<Tier>;
  
  constructor(private differs: KeyValueDiffers, private tiersService: TiersService, private calculationService: CalculationService) {

    this.differ = differs.find({}).create(null);
    this.cardDiffer = differs.find({}).create(null);
  }
  ngOnInit() { 

    this.calculations = new Calculations();
    this.calculations.valuation = 0;
    this.calculations.building = new Fee("Building", 0, 0, 0.0026);
    this.calculations.electrical = new Fee("Electrical", 0, 1.01, 0.67);
    this.calculations.review = new Fee("Plan Review", 0, 0.55, 0.72);
    this.calculations.plumbing = new Fee("Plumbing", 0, 0.55, 0.22);
    this.calculations.mechanical = new Fee("Mechanical", 0, 0.78, 0.31); 
    this.getTiers();  
  }
@HostListener('window:beforeunload', ['$event'])
beforeunloadHandler(event) {
  if (this.calculations.valuation > 0) {
    this.cards.forEach(card => {
      ga('send', 'event', 'Parameters', 'Building Type', card.building.group);
      ga('send', 'event', 'Parameters', 'Construction Type', card.construction.key);
      ga('send', 'event', 'Parameters', 'Construction Scope', card.constructScope);
      ga('send', 'event', 'Parameters', 'Square Feet', card.squareFeet);
    });
    ga('send', 'event', 'Calculations', 'Total Valuation', this.calculations.valuation);
    ga('send', 'event', 'Calculations', 'Total Building Fee', this.calculations.building);
    ga('send', 'event', 'Calculations', 'Total Electrical Fee', this.calculations.electrical);
    ga('send', 'event', 'Calculations', 'Total Mechanical Fee', this.calculations.mechanical);
    ga('send', 'event', 'Calculations', 'Total Plumbing Fee', this.calculations.plumbing);
    ga('send', 'event', 'Calculations', 'Total Review Fee', this.calculations.review);
    ga('send', 'event', 'Calculations', 'Total Permit Fee', this.calculations.total);    
  }

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
    
    this.calculationService.calcBldgPermit(this.calculations.valuation, this.calculations.tiers, this.calculations.isResidential).then(building => {
      this.calculations.building.value = building;
      this.calculations.building.tech = Math.round(Math.round(building) * 0.04);
     // this.calculations = this.calcTechAdder(this.calculations);
      this.calculationService.calcFees(this.calculations, this.cards, this.tiers).then(calculations => {
        this.calculations = calculations;
        this.calculations.building.value = Math.round(this.calculations.building.value);
      });      
    });
  }
 
  ngDoCheck() {
    let card = this.cards[this.cardindex];
    let changes = this.differ.diff(card.calculations);

    if (changes) {
      changes.forEachChangedItem(r => {
        if ((r.key === 'valuation') && r.currentValue != r.previousValue && r.currentValue > 0 && this.cardindex === card.cardindex) {
          this.calculations.isResidential = card.calculations.isResidential;
          this.sumValuation();            
        }                                                                 
      });
    }
    //added to determine change of R-3 construction scope from New Construction to Alteration since valuation does not change
    if (card.building.group.indexOf('R-3') > -1) {
      console.log('test');
      let cardChanges = this.cardDiffer.diff(card);
      if (cardChanges) {
        cardChanges.forEachChangedItem(r => {
          if ((r.key === 'constructScope') && ((r.currentValue.name  === 'Addition' && r.previousValue.name  === 'New Construction') || (r.currentValue.name  === 'New Construction' && r.previousValue.name === 'Addition'))){
            this.calculations.isResidential = card.calculations.isResidential;
            this.sumValuation();             
          }
        });
      }
    }

  }

  exportPdf() {
    pdfmake.vfs = pdfFonts.pdfMake.vfs;
  
    var docDefinition = { 
    background: 		{
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAzAAAABJCAYAAADizcOPAAAMFGlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnltSCAktEAEpoTdBehUIHQQB6WAjJAFCCZAQVOzIooJrFwuKiq6AKLgWQNaKXVkEG/YHIior62LBhsqbFND1te+d75t7/5w558x/Ts6dbwYAZVt2bm4WqgJAtiBfGBXky0xITGKSegAZ0IAKQIAOmyPK9YmMDANQRt9/l3e3oR2UG9aSWP86/19FlcsTcQBAIiFO4Yo42RAfAQDX5OQK8wEgtEG90ez8XAkehFhdCAkCQMQlOE2GNSU4RYYnSG1iovwgZgFAprLZwjQAlCS8mQWcNBhHScLRVsDlCyDeBrEXJ53NhfgBxBOys3MgViZDbJ7yXZy0v8VMGYvJZqeNYVkuUiH780W5Wey5/2c5/rdkZ4lH1zCEg5ouDI6S5AzrVpOZEyrBVIiPC1LCIyBWg/gSnyu1l+B76eLgWLn9AEfkB2sGGACggMv2D4VYB2KGODPWR47t2UKpL7RHw/n5ITFynCLMiZLHRwsEWeFh8jjL03kho7iSJwqIHrVJ5QeGQAw7DT1SmB4TL+OJnivgx4VDrARxhygzOlTu+6gw3S981EYojpJwNob4baowMEpmg2lmi0bzwmw4bOlasBcwVn56TLDMF0vgiRLCRjlwef4BMg4YlyeIlXPDYHf5Rsl9S3KzIuX2WCUvKyhKVmfsoKggetT3ej5sMFkdsMcZ7MmR8rXe5eZHxsi44SgIA37AHzCBGI4UkAMyAL99oGkA/pLNBAI2EII0wAPWcs2oR7x0RgCf0aAQ/AkRD4jG/HylszxQAPVfxrSypzVIlc4WSD0ywVOIs3Ft3Av3wMPgkwWHPe6Ku436MZVHVyUGEP2JwcRAosUYDw5knQWHEPD/jS4UvnkwOwkXwWgO3+IRnhI6CY8JtwjdhLsgDjyRRpFbzeIXCX9gzgRTQDeMFijPLuX77HBTyNoJ98U9IX/IHWfg2sAad4SZ+ODeMDcnqP2eoXiM27da/riehPX3+cj1SpZKTnIWKWP/jN+Y1Y9R/L6rERe+Q3+0xJZjh7GL2BnsMnYcawJM7BTWjLVhJyR4rBOeSDthdLUoKbdMGIc/amNbZ9tv+/mHtdny9SX1EuXz5uRLPga/nNy5Qn5aej7TB+7GPGaIgGMzgWlva+cCgGRvl20dbxjSPRthXPmmyzsNgFspVKZ907GNADj2FAD6u286o9ew3dcAcKKDIxYWyHSS7RgQAAUow69CC+gBI2AO87EHzsADsEAAmAwiQAxIBDNhxdNBNuQ8G8wHS0AJKANrwEawFewAu0ENOAAOgSZwHJwBF8BV0AFugfuwL/rACzAI3oFhBEFICA2hI1qIPmKCWCH2iCvihQQgYUgUkogkI2mIABEj85GlSBmyDtmK7EJqkV+RY8gZ5DLSidxFepB+5DXyCcVQKqqO6qKm6ETUFfVBQ9EYdAaahuahhWgxugrdjFah+9FG9Ax6Fb2FdqMv0CEMYIoYAzPArDFXzA+LwJKwVEyILcRKsXKsCqvHWuD/fAPrxgawjzgRp+NM3Br2ZjAei3PwPHwhvhLfitfgjfg5/Abegw/iXwk0gg7BiuBOCCEkENIIswklhHLCXsJRwnn43fQR3hGJRAbRjOgCv8tEYgZxHnElcTuxgXia2EnsJQ6RSCQtkhXJkxRBYpPySSWkLaT9pFOk66Q+0geyIlmfbE8OJCeRBeQicjl5H/kk+Tr5GXlYQUXBRMFdIUKBqzBXYbXCHoUWhWsKfQrDFFWKGcWTEkPJoCyhbKbUU85THlDeKCoqGiq6KU5V5CsuVtyseFDxkmKP4keqGtWS6kedThVTV1Grqaepd6lvaDSaKY1FS6Ll01bRamlnaY9oH5ToSjZKIUpcpUVKFUqNSteVXiorKJso+yjPVC5ULlc+rHxNeUBFQcVUxU+FrbJQpULlmEqXypAqXdVONUI1W3Wl6j7Vy6rP1UhqpmoBaly1YrXdamfVeukY3YjuR+fQl9L30M/T+9SJ6mbqIeoZ6mXqB9Tb1Qc11DQcNeI05mhUaJzQ6GZgDFNGCCOLsZpxiHGb8Wmc7jifcbxxK8bVj7s+7r3meE2WJk+zVLNB85bmJy2mVoBWptZarSath9q4tqX2VO3Z2pXa57UHxquP9xjPGV86/tD4ezqojqVOlM48nd06bTpDunq6Qbq5ult0z+oO6DH0WHoZehv0Tur169P1vfT5+hv0T+n/wdRg+jCzmJuZ55iDBjoGwQZig10G7QbDhmaGsYZFhg2GD40oRq5GqUYbjFqNBo31jacYzzeuM75nomDiapJussnkosl7UzPTeNNlpk2mz800zULMCs3qzB6Y08y9zfPMq8xvWhAtXC0yLbZbdFiilk6W6ZYVltesUCtnK77VdqvOCYQJbhMEE6omdFlTrX2sC6zrrHtsGDZhNkU2TTYvJxpPTJq4duLFiV9tnWyzbPfY3rdTs5tsV2TXYvfa3tKeY19hf9OB5hDosMih2eGVo5Ujz7HS8Y4T3WmK0zKnVqcvzi7OQud6534XY5dkl20uXa7qrpGuK10vuRHcfN0WuR13++ju7J7vfsj9Lw9rj0yPfR7PJ5lN4k3aM6nX09CT7bnLs9uL6ZXstdOr29vAm+1d5f2YZcTisvaynvlY+GT47Pd56WvrK/Q96vvez91vgd9pf8w/yL/Uvz1ALSA2YGvAo0DDwLTAusDBIKegeUGngwnBocFrg7tCdEM4IbUhg5NdJi+YfC6UGhodujX0cZhlmDCsZQo6ZfKU9VMehJuEC8KbIkBESMT6iIeRZpF5kb9NJU6NnFox9WmUXdT8qIvR9OhZ0fui38X4xqyOuR9rHiuObY1TjpseVxv3Pt4/fl18d8LEhAUJVxO1E/mJzUmkpLikvUlD0wKmbZzWN91pesn02zPMZsyZcXmm9sysmSdmKc9izzqcTEiOT96X/Jkdwa5iD6WEpGxLGeT4cTZxXnBZ3A3cfp4nbx3vWapn6rrU52meaevT+tO908vTB/h+/K38VxnBGTsy3mdGZFZnjmTFZzVkk7OTs48J1ASZgnM5ejlzcjpzrXJLcrvz3PM25g0KQ4V7RYhohqg5Xx0ec9rE5uKfxD0FXgUVBR9mx80+PEd1jmBO21zLuSvmPisMLPxlHj6PM691vsH8JfN7Fvgs2LUQWZiysHWR0aLiRX2LgxbXLKEsyVzye5Ft0bqit0vjl7YU6xYvLu79KeinuhKlEmFJ1zKPZTuW48v5y9tXOKzYsuJrKbf0SpltWXnZ55WclVd+tvt5888jq1JXta92Xl25hrhGsOb2Wu+1NetU1xWu610/ZX3jBuaG0g1vN87aeLncsXzHJsom8abuzWGbm7cYb1mz5fPW9K23KnwrGrbpbFux7f127vbrlazK+h26O8p2fNrJ33lnV9CuxirTqvLdxN0Fu5/uidtz8RfXX2r3au8t2/ulWlDdXRNVc67WpbZ2n86+1XVonbiuf//0/R0H/A8011vX72pgNJQdBAfFB//4NfnX24dCD7Uedj1cf8TkyLaj9KOljUjj3MbBpvSm7ubE5s5jk4+1tni0HP3N5rfq4wbHK05onFh9knKy+OTIqcJTQ6dzTw+cSTvT2zqr9f7ZhLM3z009134+9PylC4EXzl70uXjqkuel45fdLx+74nql6arz1cY2p7ajvzv9frTdub3xmsu15g63jpbOSZ0nr3tfP3PD/8aFmyE3r94Kv9V5O/b2na7pXd13uHee3826++pewb3h+4sfEB6UPlR5WP5I51HVPyz+0dDt3H2ix7+n7XH04/u9nN4XT0RPPvcVP6U9LX+m/6z2uf3z4/2B/R1/TPuj70Xui+GBkj9V/9z20vzlkb9Yf7UNJgz2vRK+Gnm98o3Wm+q3jm9bhyKHHr3Lfjf8vvSD1oeaj64fL36K//RsePZn0ufNXyy+tHwN/fpgJHtkJJctZEuPAhgcaGoqAK+rAaAlwrNDBwAUJdndSyqI7L4oReA/Ydn9TCrOAFSzAIhdDEAYPKNUwmECMRW+JUfvGBZAHRzGhlxEqQ72slhUeIMhfBgZeaMLAKkFgC/CkZHh7SMjX/ZAsncBOJ0nu/NJhAjP9zu1JKitSwX8KP8E35tr/485WrMAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAIFaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjQuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4yNTY8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+Mjg3ODwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpz+oCPAABAAElEQVR4Ae2dB3wc5bX2n63qWvUuWbJk2ZLlIvcCNr03E3pLQkIISSAESOFSUi83uZckN5BQEnBoHz0ktIANcQP33rssWb1ri7SrbfqeM6sFxbjhCw6BMz+0ZXbmLf8Z4DxzymuaPefNAeimBJSAEvhMEND/HB3fy2A6vt1pb0pACSgBJaAEPgEC1v9rG2b+/y9Mm8P43yBfBg5jf1jMQCgc6dFqMSEYOszB/9eB6flKQAn8GxJQg/rf8KLpkJWAElACSkAJHFcClBTHvomp0R8YgIgYM1vy9g+qk4M0KcKmwxWCiBj53O4MHuQo3aUElIASUAJKQAkoASWgBJSAEjg0gWMWMANUIeJAyc6wwx8Mo909gOEFcQiLO2bIJiInzGNtNhNOnpyKTncY8bFmnDkz3RAyImZM+tB1CDH9qASUgBJQAkpACSgBJaAElMChCByTgImzm1DbEcIlZ+Xgu18fiaU7g/jV9ytxxqwMbGkNIoZiRTYRJyJnYqwm7GoJ4rwzCvDzW8vRRrFz45crMWuyA+2DXhnVMAYyfVECSkAJKAEloASUgBJQAkrgMAQ+toARUdLdG8b+9/0oL01BqsOGx+4uRcmwBLzwegOGJVvg8YaN/BbxrIQZVSZhZn3+MOYvrMeE8Tm4+epCxNELk5keg+0L/DAx/ixAd46KmMNcKf1JCSgBJaAElIASUAJKQAkoAXysJH4RLzZ6Uy45Nx9TxriQlGSD1xfA7Bm5cLm9KMyLQ1JiGHk5MTzOzNwYM5P2I3kxOU0+ZKTFIhgMYurETDS1eDB2dCZeeCWJ7Vjx8wd2wMq2A0Hx2eimBJSAElACSkAJKAEloASUgBL4KIGjEjAiXGIYNubqDaG8OAHXXDoK/f1+tLV70Nbhw5Jlu5njYkV2Vhxysuhx6Q+h3x9iCBmT9i2sPBYyYQTP6+sfwHOv7IbHE8DlF480BM2k6mx4vUH0+rfB3RdGZorF8Np8dKi6RwkoASWgBJSAElACSkAJKIEvOoEjhpCJeLFShHQ4Q1jZEEJsrA1+fwBOZx+KChxwu/owf5kL7d1BuFx+7KpxwR8IUrQEEeZffOwAK48F0NntRUeXD85eE+rbQtizt8OoSNbU4jbEzte/VIBpY5J4rib1f9FvSp2/ElACSkAJKAEloASUgBI4FAHTkRaylLLH3Z4wTpqcgovPLWauiwOpKTFwurx46vmtWL7BjZmTMtDa1os+r5+llE3Iy7azP4aP0fMiIWRJCWb4+ilowkGKHzNSUhKxfrsLsycl44brxhhVyCTSbPuuDjzz0h4sXutCBnNpgqFDDVv3KwEloASUgBJQAkpACSgBJfBFJHBUIWSyxgsYDtbW7mSIWAz21LTysxetHUFUjXSgpc1jeFPsdhvzX2IpZEL8C3NtmAEU5MajZn8fUpJjmONipYjpx/6GHowblYqungAembsOJ88qYs6MBfc/tBk9rjDSkiwUP8d+OSRszcwKAkapZ7YzNKsmWrJZPEvHazP6ZH8Hdhkdy4Hj+Dhji7ZxNOd8nGNlTB/3+APnod+VgBJQAkpACSgBJaAElMAnTeCIIWRSHSwhxoTfPtOFex/aT0/KADo6A7hszg5auCI0wnB7/IZxnpsdj0073RhelIjvf3scvvO1Knz3xgm44PRcI/nfYhURY+faMRb09vrgC5hwx+9aWX3MgqyMRIwocWDAbEEH14o5YDmZI847Eupmgo3ipccdQl17AC09zMNhaTM7iwNE1UOI85E/ERNioEvJZ/n7pCugRcdjYcNSmOBg85FxBA/yJ4USWAPBKEN9pIlH2zjScfK7iELp70AhdbBzZfxyLC+vbkpACSgBJaAElIASUAJK4DNDwFJccfVPDjUaMerlrygvHj+/fSRu+/oolJakoqm5B5taXZgwOhk79rhZWYyelrxErN7kxHUXF+OkEwqRm52ItNQYhAIBlJdlomKEA/MX1SMhIRbdPf1oaPbRO5OIeHsIU8enoHJkFmbPLMCJUzLApTGxc5/H8KIcamxD94uxbacI6ewJYk/PAGZUJWJCeQLy023Y39TPfSFkMyRNDHgREvyHHiOTMe736/yoo2DKTbCwv4hoiHoeon3I8cLhaDcZj3iBWrpYnIB9JtrNhhiQPoduZn6P7KO3aPAHKxXPDq6ZI2NIpHCU0LoDx3NgG9LO0WyhQRUl3qnDtSltSZMytiMddzT96jFKQAkoASWgBJSAElACSuCTInDYEDIxwhu7wrjz5hKceUrxB31u3taJrBSr4VnYvs+L0aUJoE5BXmYscnMSGEaWZHgPJNk/wIR+m93O5H8z0hwWdLkkS9+OxVtcKC0OICneiveWNWPGlCLj2LzsBJZjjkVDdwilWbYjllWOipemtgAmVafgt5eVobgwmcUDOD723cFKaW//fS9+NLcVX56TiR/eOA62oB//9et1aPAC95+bixDzcxav7ILHP2B4cCJekch0RVBIHlB034EGvXhLovpBxuKnmJN9biqXM0/NxhXnlSA3Ix7bNzbga7/YicqiGHR3+1FSnoo7b6pEnE36oVCQRtiAiIz2VjeeenYX1tT6kc78IRE3No5D3kWqyBhc7iDSKBJ//L0xcNgH8Nhjm/H6xj4UsopbVG3JseJB8bMqnC05Dv9z53jkMDxv7uMb8cfFLozJZkjfYJtRD5F4o7bU+3Hb18pw4amF2LG5CXfdvwsZ2TZGEUY8RuqVITTdlIASUAJKQAkoASWgBP4lBA4rYMQgFy/AS6/uhSPZjML8ZOa+9GJffT9GFMUb5Y+LueZLTmYM82H68c1rR2BsVQ49G2FjTRe3px+JCXGGmHEkx7MIQCl+8eA2lPLcGSPj0eP0o6IsCYlcT2bztlYkJ9tQs68Hv39mP/JpiEt41JE2ERhizI+rTsWPbh5viChvr59FBdxIdsSjqDgd112bgF7naqxg6FufNwAbq6N1dfbDmpuMyy8bC/T1Ycn772HBej9zfMzIoJGfmRgRDs1dAWzrCaMqw2rsE+NdBIT8ieaobQ2ghuWfZcuNM2Nkjo2CKIRVbQN48KJyjCpKQCvXvOns7kcyWcoWpFqw2a1IT0ugBwrw9AYMZmYqpZR4G/JzHUiKs+CWuzcwpM4EryeEZe1BMHrP2EaQDdcAhYVxZmnpCUilgJGFQenswQDb3tjIqm/GejomTKBISWYJ7DAH3tcXQK8lbIjCJO7r5+Kia3gsazRgeJLZWBSIFa1R3xXi2jwxyGRYXxsLNqzd4EfCSIb18beqLCuSYum9YmcHirnI6PRVCSgBJaAElIASUAJKQAl8egQOK2DEQPXQah41IgXpqQlYsrQeSXyS/5UryvHi6/uYDxPG6PJ4hmWJQWvCLx/ciLtuNXGByhw0NDmZrO9EVroXZaVZNJaZk8Kws0AgTMPXjDGjEtBBL0sMDfmzTi3C1h3t2FfnwhVcH+baC12459H9GFfAYDLDED80AItpADvcwL1zSg3x0knh8vyzW/HEoh5MY2ja926owqiSFMy5uAzv/mQTFi6pQ5iLb6Yx5G36jEwE+gMw0eg/7+w8zD4pxFA0M+r2urB4M0PYKCguODkTN+fGYvduJxZt9MAhHhEKiTDFVbt3AJefk42KUgdkHPtqevDKvHYkUV385hu5SKMg81Ewbd7YhAUr2pFKYRRmX5JxI0JDWAzwCrz5t+14aUkXYum5ufLSUpx1UiGyspMxrTIO9y/sxdUnOsg8HekpscZ4a9jPC39vR4gDCVJJBFksQbZalrouSrfjR1/ORWEu191xc42epa1YvNOLkswwlrxXj2SKj7pWv6goJFFA/YYhf6nJVmzd2snAPTOKKEj//nazUdpahKiPYux738rG9Mlcr4eLlb67uAWbG/xIi5dFSg99XfQXJaAElIASUAJKQAkoASXwaRA4rICRmCUJn5JQsBYKg34m3cfSqLUzp8PTG0RcnB2vL27DiRNSjNLKf3ijEwl/3IZpExopaiyYMiEHDz2xFRed7cH8BfV47K1uXDIr3VgE8//N78AFM1PhpZgIBoNGDsvMqXn4+/xdeOWtVlTQkyHJ74fbpDpab18Is0cnYnghw9aYMLJxTQPu+nEbzr4iAU+/08GCAbtx+rQstNZ3Y/QYB668bAwG3B4sXNuBs08rRoCln9k5LrqgEh56KFIoEmp3NOOtRWuQXp6Mq6+sQnF2LJ57aj1+s8CJMxkG52eoWZsP+M/bqpizk2eEd8k4JcRqypi9eGZeJy6dM4q5PCwbTZFy2lkVFC9WnPL97ThrDD1SRjBY1JNjQk+nF4tepgrj/pkn9lI4WQzvRnuHH9+ek4PbvzbGEEN+CkYzPU6cKMryt+GB17t4XCRPJciFQ6u4WOgvflSNSgoqyZ0RPrNnFiLzkfV4Y1cIl11SiRzmAnnaVmK7x4Sffn8CSvKSjIizWTOKONYBJNMb5mz2GMJRvDa5w9Lx/VsKkBBL8UXBVD06A3f/Yj3oEAJ3GTlFh7tG+psSUAJKQAkoASWgBJSAEvgkCdDEPfQWYJhQbqoVP3uuFfc/shMTx2Vi6sQ8eBga5qaAiY9jWJXDiqZWn/H5wgnx2F3rxY1312HZ6i4EabwvWduL82/bjDfec2Fklp1Cx07jOozTq+MZXiZllUNGsviEsdno6enFoy82w903EEmoP/TQjF/EePf4BpCXEWfkvAQ54H37XCg6yY4Qxc8ZFbF49x8tOPOKtbjuy3uNEKyAn5Y3w7LWr2rEn1/agRCrnoWZKzN37nrMfWkXRUwQWQwtm1oeg3GVKchKi0VrUw/eWdKBiQzHkiCwPc0BXHleAWZNK4C/14sXnt2Ih5/egk63H5NnlOKkKnpOHt4AF8cWQ6/K669uxVN/a8SJJZQ0FAmULsY/MgnxyJx2Tineemci5i+cgkvPKqF3JIjNm5rx5KJ+nD27wAgnW/HeXhSe/jbeXLQfVgquytFZSGXYmHiDDA5kdseXyzCG3rINq+tw64+W4I0FdXBkJOGyi0sRT3EVoPgM8c/DMtffurwUZcwVam3swu8eXIV3ljfBwvwXP/OBJN9HvG8cGhJ4jRfO24EX3tjN84LIzU/B1LFJ2MMCBRK+p5sSUAJKQAkoASWgBJSAEjieBA4rYMSIFS/IzGI7Ro9Ixur1bcxR6aQXgKWUWUlMqo8NZz5LmkO8NCFUlDsMo/a06TGornKw4pgd48rjMHN4DHNpzKiuTDKESSgUQFamzTC8JUSpqcWJfzC0KycnBddfnI9O5nwcbWUtMaGH+mkGGMolhrd4H/opoAry43DrDdn46jdTGOYVQWvhh9aGXiza0MlzGc7F8mRr1nfi5xRPDW19SGLuzCRWQxs/KsXwPOzZ3YHXdvuRyrApERz1rEMwemQqxQmwc1sLvnlfHf7jx/uwYmM7K0tbGTKXjN+92Y5+8pFKXrtY9OCJlR6KLJ4/ZLBRkTBseAYLEORhwrg8honZISJr+7YupBSY8eRzOzD3+e1o7g7iiR+P4pjSjLCxAZ5soTiSTTxPiWlxRqicjx4lW2wMLjqnEDnpsTyWDIpSMYvhaFFhYmOBg2H5CTBR/axd04gf392Iu/+0m3P3GSF0IopknlbWpG5t6MYNt+3CXc/tNwowSN5NUqIFTDsyxNyQ6UTg6qsSUAJKQAkoASWgBJSAEvgUCRw+hIwdS1WqFSw1fOUFCfgyw6m2MVelpq4bX7+sFAuXt7NccjwNbnAtGA8FSyJmTGaImM8Dm60f8xbspEEcQlmxjR6aRFYiszJkrF8ittDnM/FcG06flYe2Dg/DucpYengAr7zex/SMoyvfKwtVJjCno5GLavbSO+CIj8GIshQ0LGpD1ZU2LF7ow+//UIbLzhqO5tpWPPxSTUTs0Oq2xzARPlGmHzHB0zOYFb/ajQ1b2zGqOBkTGRpmSYhHv7cfq9e0Gfkr1EaGxwNMgLcxV0a2Xk8AVSOYiU8t4XTJejgDDLGz4NQiEWiR1uPpaRqeFhE/H7heBtvi+p147a9b8c4qCpbUWFxx6UiMHZmGM84swQMvt+F0VgI7d1ahIQzdTi9zkkIRgSYjZxtGH/wgRQHEIyJhXhlZicjKS2YJa66Hw2s1QI/OgMQCymacE+UrOTSMNSvl2CjKRJAaqiRypNG21xdEZYUNtngLrzND2DgnEYdy6NBjB0/RNyWgBJSAElACSkAJKAEl8KkSGLRqD92H5EVU59nw/GsNeOTxtcjOiqfhbMJ0GviTxjooRMTo5XovNIRtVibE08pPTEzi+iv0rLC0cTo9Ayn0aIjXw8fwJElcDwRZ6YvegZNn5LKUcoqxPkvt/k5c+51FeJ75IyWZViMf49CjivwieR4JXL9lyVYP9u53GaFh4yYU4H9/nYcuZxDfujkPsyZlI5bVv3q6+wwvRtTrIR4GMfZFBIgt7vOyuIDDhKVr2ulp8KNwWCryWRK6pbGHYXAs+ZxGA55Wu+EZYtWxHmeA55mQX+BAjC+ELe1A+fBkw8B3OvtR45KG2T77kWpq1B0RtSFvkeHz50j/nRRgz63uxcPPt+G9NS2Gp0QE1jTm9kybkItEem7e/OtmlJW9iQWr2siZFdpk8hyBzEOURq+7n+F0QQpOCxYxj6is+G3c9LO1qKl3o662B7vqfMbY5Kx+ir0uVoATJTJ2XA6unp2EWy8rQGFOnBFmJgLF4DI4Pmo4SDihjFe6k9+i3qzoXAanpG9KQAkoASWgBJSAElACSuBTJXBEDwxtVeNJvKSOfOfRRtQ1+XDSzDwasWFcfN4IVhGrwaqNTjgcCXzi72dSfb/hnQiHpWkLPSMsxRxP0UILWARMAtd98QctmMmqVtMm56G93YVMVs76w9ztDGEKoyjDxtCvSA7G0cxcHAijGcL21Eu7UczKYkVcHPOq68bj7PO9iE+KRRLD2JydvXj55X2wxsfR+2OFzcS8G3o+/PT0WOmZsCfG4p47p2DyG9vx7Ufacf1lblQxEV5WXtm5vR0LmsM4dbjVGBf1Fyay1PK7Sxoxc2I2ykZl448PTmF+DUsol6Wj1+XF4sVNLDttIQeL4Y0R8WZ4LAYnJF4aWfdFvCZcIofFEKwYyTLNadkMzWIhAREWSYkx9CixhDJFidkSi8qxOXj59VRMmkDPEAWGnefKgpTyHhNDYUHP1qKVzagsqcB5F1VgQWUW20vGyOFp2LhyL5pYoSyGMW92jimBgu6VeXWYWJGG4rIs/Pa/MwxR5ZeLzGvG4bEMtpnXVuYgeTYyYq5FQ3biXRJPT78oGW7G/WF80hcloASUgBJQAkpACSgBJfDpEziiB0aGYDxx55Fnldnx6uJuY40Vr89Pg9jMSmPZqGuQCmUMC/Pb6D2wGMeLkGlu88Lt7mMLtPoNI9hi/B5gvszo8jR6bQJsw4Y6egneXtvHxTFZ4YuWvnhJjnZj+goSGAq2a4cLP//teixf04xuJtMnUryEaJDv3N6Ch/+4Ab9f4UUsze1GelQam1xGSNVKLqa5bHUj2lgFTASF5Hxgu5uCrIPfzfD1+bBsZRtG0PsSXcVevCkpDhvWrOvCw09uwra9PcjMcVA40etU24knn9qEp9/3IDsOaGp2si8nXMzp4SmGEDDEARWIJMs3G7+70OMmPPIxUfM1NnpRW9tFDwnXjWEbf3l9L+qae1HAamCTxmZhH/Nxamq7Ga7WjySWT5b2GxpdMHPsd82twUuv74KTi2iOorBKTbDhvUV78J//ux1Whtq1NLuM8tYsZoala3vw3Cu7sILz37SpCc++uBV1Lb5IGBr5d3T2sV0n1/3pQww9QBaOr7XNZfTX4wmigCLIcP4c7YXS45SAElACSkAJKAEloASUwCdAwDR7zpuRR+lHaEw0hYQWcY1I/PIHVZg1owDdrBomieHP0xBu6wgglTkcbZ0+IwwplqWWgxQoNj7J72fZYfEUlBYnwkNjPUzvzVeuGEVbfoDhXXZspZfjvge3crHHoLGK/eDD/SOM6MOfRWDZmKvjdAWxpiuMC0bHIzuF+TYssbxyRx/C9BiU0MMhCzf2MuSNEXCs7EXPAse+tzOEEbmsDsYwsBwuOnnVOQXIZ/7IyNI07N7agK/8YCNy+LtUNYtuRn8UGw0dDIkjlEnDY42Qqm37vOjgujkjmdsjuSXSF7sw8nRsFEgfthARM1JBTeYqeTxWSS7hJuvLuH2RcsmpXHNmf1uQpaDtKM21oZnrtyys9aOSgiqWeThxnLOL4WzUI8Z8JKdfFrGs4Po5Jdl25ucEsWiXD2UMyZOFK3t4rF1ymhqDePyu0Tj7hHzU7GzFb/6wHSXj03HLV8ZQ5AXxq/9eiecoKAtlMU+qyXieK1sfx0WExuKmNjIdOh/jAH1RAkpACSgBJaAElIASUAKfMoGPJWAkZ0TWgDnv5Awj4b6I+R9TJuZi2apmhkHZMG50Jjq6vFjwXiNWsKqXrH3SyVyRyePScc5pRcwpScSuvR3o6vax6lYuNmxqwSNP70YGSzHXNPpBp46Rp3EscxZRYaUFT7saLnogeimabPyeyopZog0kl+dAz458F+EQpIro7ApgAteL+a87JiPexhyXrj48RW/KU4udKE6zMgfkn811+WZn+5KD4uyNiAgHq5SJYX+kxTePND+RC9K+iBspoiDCy8UcnTh6vCQfRpLt5TfZZG6DH43vIlB8FBoigkTUOZh8L2PkepfG/KUqmqzhUzEmFXd8YwwXrkwwKsjJop1STnrRwj2496F9yGUon4ipoW0bHeiLElACSkAJKAEloASUgBL4FxI4agETHaMYwx3uMLYv8OHxp0fhsjnlDAHrYigYcza48rysMt9JgfLTX2+i8U1vAiPIfnL7OBTkxRkGdC9zPHxcvLIgPxVvvL0bX7p6O048JdZoXjw8n8Qm7Uh+iJF0LtFrQxqNihgRPNFNjhdvjC3ehhnjU5BEobBjZw9W7PYii7ksR1pxXnJSpF0JZxvSrJFXIi9D+4r2Ke8HG8vB9stxIjxEQEru/tDzhn6Oth09XuY/dOxsxthkMcyO7gCyc+NwzokZyE5n8j5jAHfs6MZrS51I52KdIoyMjROKzsnYxZdDzWfwDH1TAkpACSgBJaAElIASUAKfGoGPLWBkJOIV6GMixajieFx/dSkFjBP1jX0oLkrErOlFyMhIYO5EL95ZtM/4XlyUYiT3v/7WLsxb1MzFMDMwhgnkf6L3ZSdLNCcynEsqfP2rNxFn9Z1BMBINw1ItSKNHRapvRUXCv3p8n1T/IkDEW9XP0mibWoKQFBzZJNenkN4m9bxEeOirElACSkAJKAEloASUwGePwDEJGJmGPI2XamEpyRLiNMDyvn7Mf6Ias2YWMETJh/TURCaM9yA/14GeHi8raZmZw+HBN3+02qhIRl0AM1uRler/9dJFZhTZJOxMBIsk6w/1XkR//zy9i+dJQt6im3h3DgyVi/6m70pACSgBJaAElIASUAJK4LNAgCbssW0iOmR9FT/zVnY3h/CDr2WjeFgi/v4Oq2Ax78Xj6eeaMUlMrPfByyf97y6u47EBXHBKBuqYaJ/IMK04JofTZv5MbeIJknyZz7t4EegiWESEyp+PfypePlO3og5GCSgBJaAElIASUAJK4CAE/k8eGCkt3M58mGms+lVWksCFK/uYS2LCuafmYt2mLkwYl4k1G1pRWZ6KvbVurN7qxtRxyVwEMoQ1m1xGsn0cRZDmVBzkyuguJaAElIASUAJKQAkoASWgBD5C4JgEjAQdSUK5mTFIl56bw8UWA+jrC2LHHjdFTBC721n6l9W/QiyXLOWD9zvDKGF+RV66lSvEx8POBRUTmV8ix+/Y50f84JoiHxmd7lACSkAJKAEloASUgBJQAkpACQwhwNVMPv4mOSJeWe9kmB1Z6RYuHtmD1Vv6mNvCsDKGhVXk2A2BM8DV6eXYsVxoUnJKWrtCaOl0Y3ihHcOLYuDmOiVSweuzlAPz8WnoGUpACSgBJaAElIASUAJKQAkcLwLH5IGRwUnYl43yp43hYBaqFAcXXZTSu4wq+2ATT82Qr5FqXtwhORdeJv7HcwFHO5PIhx7zwcn6QQkoASWgBJSAElACSkAJKAElcACBY/LASBviWeG6h8jgOikiVCTpfah4kWMOFCbRXJcYemmkAIB8j+6T43VTAkpACSgBJaAElIASUAJKQAkcjsAxCxhpVESMVLL6uJsKl49LTI9XAkpACSgBJaAElIASUAJKQAgccxllxacElIASUAJKQAkoASWgBJSAEjjeBFTAHG/i2p8SUAJKQAkoASWgBJSAElACx0xABcwxo9MTlYASUAJKQAkoASWgBJSAEjjeBFTAHG/i2p8SUAJKQAkoASWgBJSAElACx0xABcwxo9MTlYASUAJKQAkoASWgBJSAEjjeBFTAHG/i2p8SUAJKQAkoASWgBJSAElACx0xABcwxo9MTlYASUAJKQAkoASWgBJSAEjjeBFTAHG/i2p8SUAJKQAkoASWgBJSAElACx0xABcwxo9MTlYASUAJKQAkoASWgBJSAEjjeBFTAHG/i2p8SUAJKQAkoASWgBJSAElACx0xABcwxo9MTlYASUAJKQAkoASWgBJSAEjjeBFTAHG/i2p8SUAJKQAkoASWgBJSAElACx0zgmAXMwMDH7/Nwpxzut4/f0yd7xmd5bDLT6LWIvn+ys/+wtWPlcKznfdjzRz+ZTJF9n0bbH+1N9ygBJaAElIASUAJKQAl8VghYj2YgYizarYMW4+AJsi8cBvzBw5uQdpsJAzwuEBpALD8H+R4MAVEDVJqTzzFsP8C25LPNYkJ/YACHb/loRv5/P2bo2MJDBiTz+mcikb7kGJnHx92kH2Es5xLRQds+sE05Xs6LbvL5aK5J9PijfRdhZLFExufndeHlNK5RiAMdykRmLdfOchBZbFx3njhkuEfb/T8dJ9zlxhBO1sG+5B48lHiTMRmc+H6ke/WfOhr8Er0uB7tvhx4vY5FNjtNNCSgBJaAElIASUAJK4NMjcEQBIwZcf38Yi+qCtM44kAD/xECl5VqQYcGITKthNB90iLQq39nhR3qyGZXpFszf5cfoLCuykswIDYoYaT8YYPs1QUzItSLgD2NzcxjTy2yGqBEDOWIaHrSHT3WnmR33+Ti25iAm59mQGGMyDPYwjdR3avwRHjYOQYxXGvbCJi3VjLE51kMa1AcbsDDwc96L9gVRzXNT4shHjP3DTZxs19cH0OGL9GtA4hjysiwYScYiZD6JLSpeelwhrN8fxKQRdsRRzOztCCAz2Yp4OwUqh8B/DAwtXQFs7WLn0r/8yRx4rccWWZGe8OF1596PvVnZ764GP+r6gTLeQ93eMDrZx6wCG+RaHXivRMe0t9mPpqAJU3l/HQ7p0AHJnMy8z/1y7/PeHJs9OH72d+B1kTbbuwPws/XsZA5SNyWgBJSAElACSkAJKIFPjYBp9pw3xc476GahVeh0BzF6TAouP7sIdtpmFjHWacEFfAGsWd2M5xd0ISvVGrHhxXtAA89Gz4CZJq0naMGd366At6Mbj/+9A7ddPwJb19TjD290oizHxmZM8PtCSMtLwA2XDseyxbUYcCTjjCnp+PPcrdjWEYaDokEeaouBKkalPHkXQ1U8AvLUW4xHw3DlBxEW1EIfGKkyMTnGOugRkO9yvrQT9QyZ+JvRBs8TL5Fsco783uMKYsy4VFxyegHmvVWDtzf0Ij0WSEiLw01XlyEp1oxAIMQ5D3A8ZsQQUGuTE797ch8SEiwRzxP7swoP6YSbCItoP8JSvAMeTxDDRiTjuvOH4f0ldXh2sROlFIbRbeg5YjwPyDytVnznmlKyj3AUlkF/AGvXteDJtzuRm0JAPFY8IrIJI5m7nC/XR9oUT4m8G23ymOgYxYtg5hf5LvdAfasfZ5+WiwtPzcNrr+zE6roApo5OQkN9L+raA8a1l+vR2B3Cl79UhMmVqeyPTHiusJb+Fv9jH57mvMqybAYvGVP0WspnYR713Mg9dKAnQ36r7QzimvPycPqsAmSk2NHX68e6tU147KVGWGMtFLyR+zMyY3LipPc7w7j9+jLkJJrwuz/uRj9vhnjx4gxucu0CFObGPcvdhjeHv8XazcZ1KS5LxFfmDMfq5fV4fH4XRlAcypxkk7eAeKR4XtWIJNhNYWzZ3WvcgyJ+ouzlWJlr9N8N4S2b8BWP1mBzkZ36qgSUgBJQAkpACSgBJXBYAh9ayQc5zEyjtMcTQlZ2AqZNLkCfq5ffAzS8TEhNi0f12GwMBNfivje7kcaW8ihkkmJN6Kbhv60rhIr8OGRnJcAd7IXDEYupkwrg7+hCjbMdBY4wltKzEVrtx5duSzV+a9vXhka/DbnZ8UigcFnRGEB5kgluehmau8PIoBenggakjeMSj8V7jUEEvQPI534xPOXpd2ai2TDWI4YzjLGsa6ELgIZiLD1Bk3JtsPDHjfRepHCsu9iueE5G5VqQ67AYzqX27iD2uMPoW+XD7NMKMY3j3rK2ATs8bpxA0RLDAQwrdCAphoa3nZ6ZeBucTi9MtFqDXi+WNQQwPCmMvRzbSUU27Gnyo1b6ocVanm1BnvRD47XbGcQOGthe9jPqx1mYSsYNe1qxt7cb+Tx/iXh5aN2W0ytTSLZRo14M85DFhkkT8ujVMKGprc+4eimp8Zg4Pg8JtvX47WsdKOJ85+8WT9EAislNRFFfXwhbmkJs34yNbSEU8pgB8oilgNjTSU70qEyit6GB16+lJ4zSfHrF+geQlGRDXk4izBRsOUUO3H7zRLz85Go88+tWnDUj1mAucxk1MoPXMhsdHb2GwS4iyk7RsDXFCifbqW/zG/0j3oTp9JzEUUyIQd9FFuubqCT4uZLerlxeyyDHHTnfhC1k+sMbS3HNRSPR2+PB7toe5Oal4vLLx9LrFIMf/q4GGZzLijo/hQ3P4/0zrcDK+4nen6ocFDooJEMiYIAaemT2UByDfY+hVyaHfTXSo9TK8VVm20C9hUYKs61b/Jh8Qham8Pp3NXSixt2BnPgQlok3ktcghSJxYo4Fi7YGcd+9Vciw9WPUKUsx68R4iskwFu5j57wHQM/TDHKMt5mNfny8WjbulntvWrEdsRxTVBQd5F9D3aUElIASUAJKQAkoASUwhMBhBYwYz1Za2n4/vQzBMFa9V4MvXbXLOP3O34zEnTeOQWlJImZWBnDlqdlYuqwF87f04TJ+vrEgBm+824Ily+rhbnXRQ2GF1xswnkRjRwgjTk/DzTfkIobxRdv2e/m0m3FBtGQ3bOlEup2GPUXHT68uQGwoCEtiDMaWO1CzuwsvvN6CHo4lIysOf7omH7lpdmziOXFUE400auetcSMl3gwRX3VtQcyakoo7v5ODZHpE6uuceOHVRgTZ3r3nF6CpwYORo9OR5bBi+ftNeGO5i2FAAzjlhHT8Yno2fG4vWnpN6O3zG14Dk9jFfNLf1d6H7965DIto4P7pvirMOTkfjz+2Hr941YX//mYh7r4kG47MBAynt+G+B2tww+VFqK5wIMzkn1UrW/D3FU7008sxY2Iq7p2Vyxg9P/bSYO6lR0Ge0mNnEGWzUnHLN0SMAMuWNdMr042i9MGn/zSwA2QQ5F9zowtnfGO1YSefPTMd9//HFAqhHOy7pxFTvpqBF67Ph4M81q1twe9fbscpM1JwzZwUbNvjwd0zstDe7IGP9ni304/x4zLEJYC/zW/ENZdkYXRJEvaQ+eMvNGJfnQvz/lGLNgrMi07NoXcjhCqKpe9d6ceyrR6kJhI4Nz8FTj95/e//rMTv/uCGYzLFGgVMFUPbsmjIX3V+HibQQ9NDgfPiqw2oo3Dx0sifNS0NP5mVAwvbXbykCa+ucDFE0WYY9m56qMZXJuGC00vR09KJ79+1Bn9d6kNJdSJe+vVUTJ1eghmv1mNFhwkPfK8EhTlx8Lh8eHdBI1Ys6SPeIHxUDSLUmiluvs7rMW6UA/3kvYDHPPi+B/dcwXuJwvLVt5vRwVvxq5cWwn9aL+rpIfTS22iIx7VBTLwnE7fflGV43/bV9GDuK0248+v5FE9WxPL+feRnJXj2tSYkpsdg7pXDUZAViyZeo5ffbMLa5gC+cWEu4pgU1jdgxuTRDvzlLzXY0hpCEoUjNZFuSkAJKAEloASUgBJQAkcgcHgBw5MlwEXCiWTLyE7CHffmM9zGjJnj0+Fx9mHF8g7Mmp6LSy4cBWerE48/1INpdxXglIkp2LCuC+edOxK+plb85M/1RpiVGPEzL0nBj/gE30FvRluHF2PH2+lxMaPPG8KpDA+64ow8CopmnDhzGKoZWtXa3gsTEyCmTCwwvCZXPNmClT+YiFIaqi0UExWVOUihgHl/wU788q1unF0ei3o+ZT/39Fz88KbxGKD12tbVjwnVBSji0/pf/60N5583yhBPHd0+OFLiUF2VDVfHMngzU/CDb4+HORigV8CPaY4YIxxOXAEGLBqZ4jGQkCMwnMwItSIfyc/gN5x6Sgk9UXaYGFPV1tSNe+9MonGeh+aGHphsVkyuzoMlsApb+2y485aJiDOHI2ObHGOEk/X3h3DBtZm4+9ZJxhio+TjuPOSmb8Z9L7Wigh6kfgoOozf2O8BhNHuoeviPCCzZwowLO+nCVPz09kmIt4Thotdl0oQCeqfWY5vLhksvroS3N4BYeim27epEaWkGrAMhdLsDSGd43IQJ+TT6Q7AIc3ofQjT0u+OTcOUl5Qwj3IVRI1IMQVs8IgNTxvbgufedyKAIFG+JhLKZ6M2pnsg53JeMpAQrXD0+PPR2Fx68swpnzsxHa4sbVaNzMHZ0Jm69fSUqTstjmFcV/L1ehEwWTOJ805PW48H5PRifb8P62hDuOD/dEEmvz6vHX7cFMOeMRNQxtO3RJzZjRF4M2gJWPHbfJH6OQ+1+J0ZVZGNcZQZ27F0lOtwIUatlbtW9P6vC+bzHZAxxSbGYObUAlv9aiWnTCzGpNB6L32nCPI8ZT5w5AlZ3D/73pVrjvvUT+jd/UoR7v1sNLz2Rna4AOTGUjSF8gfgEpCRKaJwF0ykeV6x34uZbqjGM4qW5rRfjq/NRPSYTX7ppFaZMzcfkkWm8hvw3y9+PBW/XwhsMGqGSKmCM21dflIASUAJKQAkoASVwWAKM1D/8JsafhIwFKDzKaBR+54axuPGrYzC9mh6Kvn40MfRGHpPLk3epLiZWbIgfAjSA5Yl3kJ/FUyCGrWz9/gF85aJiej1seOapdaiqXIh3ljfBwrAsCaORYyWvRD6HaIj3e334za9W4qzbVqGrN4SiYcn46ZwCjBqWhLde3YyqigV4bVE982TYFxNg7INiiw/OaVSa6bVpxf2/WYVr7lmDhnYvSoanIdnCvAVaiy0NHaiauAB/fHE3YhJjUT4yBeedUkRhE8Sv71+JqpOXYN22LtiZ2yK5EmKgRzfJcYiniJFpCSPjN9rwfo5BQtxefm4DrrxzHZkE8f7iPbj8G0vx5Kt7YIm1UzAk46LTC5FMAfTIw2swpnIR3lvXyrwbM7wMY7rhsjLEmYL45X+twBU/XIXmniDOOacUVQ56gxgKJ1M0KpaRU2pmMjY8fwLWv3gCfvmDCUiwDmDp8hbcdO0IpDNM68EH1uDMb61gGFsfzjyH+xg2J6k+PW09uOGmRXiNQlHmt2V9PUaPXIANO3vorbLiod+uxrU/WYdeXq9isvb1BTlPhqvtbscfnt0Fm92Kd17fhisfqMPYAnvEsyYD43XgCHH62SPxrevH4WvXjcOVF5biwqkpOGl6Abatr8OEy9/Do8/vRG5ROr56TREuPmMYwr29+OF/LMfNP1sLV8CMC84vRQY9FZLTxEg2pFJkSsJOO90jOZkWQ5SlUzQtXtaFH9y6D16KJg9Dy15+cTOqL1mGJWubkZaZhEkVcYb3JMSqEROnpeCUafnYuXE/KsYtwD0PbOA9Fca4qhT008si9x27oqiU+5D3MDuPXvIBKkUHvW+7tjXjvvtW4ls/34DWHj8qKUau+O4m7Gv1wef0YNyEZTjh9CKG3sXj+WfW89oupEdmD4rLsnD7VTlwuvqZK2XGe//Yiau+uxxbmkPIYIe87XVTAkpACSgBJaAElIASOAoCR/TASJq8GO82WuUb19bi4Rf3I4XhWMPKUnHjdWMoaMrwj+19hkCJeGrE5BPDPmr6GV8/HAqN3OyMOLi6e7GQYVHVZ9owfzk9IqcUG14MyiHjXMnzsNLTI6FAKzd5YWMejo+iKExDMi8nHn5vP5at6kbJLBuWLG+nETzcSJb38zwRJ5nMh9iw1YkJDBH7+o0T8E0apYnJMQxB6uVczEaCeUuTh2XGGM7TJ6FtYViYBZ6eGot2JuLPW+ZBZYUJ769vx8zqLCNRnQWpPthEYLFAmbEZMxUV00dOFAOdbS488FQT+hKtWM/wtrNPKsCLc2dFPFlSfo0J+Fnpcehu92A+E9vHnmbFotVtOH0GQ8boFUijN2mA1QVuvX0KbqdhLoUGwmEzyobFsCJWAHQiGeFGwljEotPpo7fEDCeZbljfgjte7MbSM0cZgvL6G6rxDbbBzo05ZmVQNXHwa1c34rW/uHHb5AxDEDUylIytMpcoDI/bhz17+uBiWJRUoBMhalzPwUtqCDZeY7neIuKEhXG5qYzkOBOFx6uvsAhDgw+pzJ1pbuxFUVkGLGw/rzgDW1872Si44GY/uQUp9J6xCATZ3/efM9gqrzu9QWF6q8oL7WhmpTHqFSO8TuaQTKYtFB0zEu3YVtuP664chuk/T8ETT+/C1t1OnHhCMXaeWgYr71cR0WZeaxm2lHweNiwOMWxrw+YOmCfZ0bSzG7OvXUwhEsbbf8o35mFjXkzG4L8VH9zCnJ/sX7ihEydNycQtt03m/WBCEsfSwXOTmKf1wVZoQT5zhVxdHrwxvxNTz42hwG7DxWeVoiAvHj5ep16PD0+/WA9GMGJ4KgekmxJQAkpACSgBJaAElMBREziigJGWxICVzclQoFee6OQnJmacGsBVlwaR7BCj0Gt4ISQsiWa9RFIZ58hp0T/5IO1IpbA+Ps2PibVRLFjw+lO9OOWUeCPER/IMpCepYCXvRr80FFMl0VySvblP2nGzkIAtxoaSwljse7QTV88ZZlSNEiPVRKNaKlotZw7N3+4ox4ljM/Dssxvw8ntu/OreSaATA53uiHdIjH4RW0ZlNX4K0uD1MYQrniFgjAjCioX9uOEr8YZRzabBKLd/2kQXcDiGmJDxGvM2BBTLKdP7U1aeiOuvroKvs4deoNVwFKTiBzeNZY4I813III4GbSqT6Ze+3ouLLyIDjr2fCSkDnHN/nw+PPrYZvSxxNYFzSI0zobY9Gmoka+lEqnz1dHow+4SVwDheSvY9PI2FDKRcMT8HmVvz1JOb0E6RVs02Uih8WruCEY5inTOpX5iK4BOBGhGeEe42e8TDxG8fXAsRlTJPGad86uX17tvDHCUWKhBdJo3JNZO/GoqJ3zMnqLqcIWA7/bjtxhReFwt2bm7GC/ObmYCfgMlj07G3xolzCtPg5jwemLsdZiqMidWZsIeD6GDpZiu/D2Np6nVbutB74QBDsPIw+plmvLK0F2CeyVmnlGBYihkTpmbjigvLsXFVDX75yF5ccVU5LmJuktsZMK4PR8cQRYoxzjudFczCPD94bRZe/FEl1i2rMzxngqR+Xz9zpayG11G4yHzl1ctCEnffOBpT6K3585/X4+2N/bj/nskMK+T9WB82RKDkiTFphv3w2jKsrIgFAt5+3Imv3JnBcD0KF+43J5E3r10ixWE2BZ3w100JKAEloASUgBJQAkrg6AkcXsDQuop6Xyx8+j1+ciEWL80wjK7U9ATk0BCc/1436tv9TNS24PTThyGrJB3TxmfyCTVFBp9+x/DJepghMyIsYig64hnC9I9VLTjzxAJ895YxmDK7E7NnlyCRi4tIKWLJu4jlOTzcCFOKsbPiFnM+xDYU70Yis9rfXrwfc84qwVXXjsVojmlEOb0IfOovximbj2x8l5AsMabjmbT/tSvSMSw3EX5XGDPHJBtP6OV3MU/FkxDLscUwH2XVhlZMuqoCv2KuxM56L05jSJlU0RJvkOFxGdK+lMaV/TJeEU2sAGDMNzZkYdJ42PAISSlhEWTlFamYzjyLeBrkw4cnY9XOTsxita577hyDc+Y4mTsznO1Y6L0IYc3mNlQx7OrkGdnY2xbAOWeWoX1fK2pagshhlawQk8xlrnb2awvaMO2sGArJiBiRcWygEb52UzuqLirDySfkYGNNH845owzOxjZsqetALMWjkcPTTsObzGXuxvjJQoSMzIcfjWV/7AwVk5wnK0PT5PpJ6JpXPBuskjBjVhHuYsW2eatdyGQCvKz3IufLcUk00EtL7chj4YHU8WYs39CF5k7mOzEfZE9DH0oYjjhrYg72bFqJDds7cf4JeThpWga6/BbmLpVh5/paVivj+ivDLQwfs2Leym6cv6KBIX7D8NzD9Gxt7ULZqEyMLErEvNc2o4mV76xSa5nuqnPOzMP0CVnG/VddnWZUjYuPt9Lr1I0GVmw76bQReOxxE4aPzqWIysCKd3ajo7sfjtQs3Pb9kbg5Jpb3SgJLMPd8cA/LvWeV+4miJjklloUZcpDPQhJ9XX5cex49KxS+GcMcmPt4OdaxlPWJE7Nwyy3jUDWlBbNPHg4Lc6r+saQNF36ZhSt4nYUvawsYzwIG71h9UwJKQAkoASWgBJSAEjgKApbiiqt/cqjjjNwX5lxkM2apKMduPPWPj2PpW9Z9DbFa1dL36/DYC/XYzqfOhTSsR5ZnsaQtk6jrullVjKFfqzpQyCplXS1OrNzO/AB6JPbt7cS9DzejJI/lgZkEXjkiDU31Pejq8WLHjk6WXDYhkyE5C99rQf6wRIToiXh3aTuVARPKRycbYVd//GsTy/76WcY2lh4MC7Zt70J2XjLaG7vw5KIulLKms4MWYg8rmxUzZ2b8GCb50yuxr66HhnU83F19tLUH0LS/B39Z48Q45kkUM/l7184OfP/pZozjoosVo7JQWpSM2pouONnOls3tqGVN3jR6QmjDGk/oQ2RTxTmlspTxytWtWM6qZ+dNccDT7cEyMdhp3CfzifuI0nSMY8K6hBV10dCWRPkXntkFrynEMLVsjByeggYy62Yo2N49XbjjmUZUF9kxfmwe+aSiobYDf5y7E53Mj5GywyIqwzTUJ7Eyl7PDjXlLGRJF4SJeECknncGKYEs2diPdYca4sbkYMyodnS3deOjRbfBabRhBz9UmCrV3Gn0YWxrLaxGHrZzfvIW9OPUMekrCASx6rw1eipfpZF63p5PenwCKc2OwfkMb5m/uw+hhscgj8353H15eypLGFDBeirbqUUmsqDWA5SspuOgxom4wFpxxdfuZ0O5CWWkqk/RzWbXLhoXv7safXmqhqHIhPzsWE8bnY0SxA3t3NOPhJ/ZQgZqlqrORs5NDxu+s7EBi7ABKitMwkvdNLMXU0iX7GK5XxxyUAApz7QbP8uJkNOzvRpiV72ysbNBC4TTARPm33mrEnlY3SpjTM34sK9OxiMS8t3fiV8+0MDyxH0XMWxldkQU7RWRdk9u419bvdKGc9+H2La1YwKIUFex33JhclkQe4P3kZDnxBHSzMtrmOg/bdTA0MBZPzd0FZ8iPkQybG1ORiRDDHV95ZTvue66bwj2VpagDWLi0DZKnFfFmHerfQN2vBJSAElACSkAJKAElcCCBwy5kKQdLWI0s1tfCcB4fjWM3nxobfgsa8W7+TWeVKCs9DHu4bsjYohjmTwS5PgvXb6FBm8XwqE6eZ+GT6zQmlNfzmDQa1w6KgK08ZjhFkSSar6HHQDw0RQwpkyfcLayqNYwixMU1aFhAC3myKCMFRzf3b6IX4ntX0XtzbSU2rNqHh56tx9VXl3ORxSI8O3cN/uOldkzmOiJBttPJEr0Beo5GZNuxl/kYLfSQTGUeiYtjbHaG6PXhuBjq5WeiekNPCNkccxwN7k1cn2Y85xJD43d5LYUS3TqydksMxQOn+sEmbCQsqZXjyufYY2hQt7EdCaQTg14Crfa0hzCc/UtI2t93+jCFCe9pLGvsYcW13RQ85ayglcRwrdXM55D2CzhXeUC/kt6HSTw2kftW8rcihoal8zymvETyTdh2C/sSbrKOyZBhGeMzcaAb2EYFjXoJP9vANtI5plTOpZbrvchcE/lZ5t7IdjJ4rZLJo5vhdW5yyuN8pA1ZnDKZ/TJ/HfXM9yjgOORq1PMcRzy9ErwZktmOLIhJ1HCz0EKHrM3DeYi3RnjJn1Rp6yTzFnqPJjK3RdYKWkeBM51zlNC9NSwlPJ3MRXCsJPMRXItGSgtL6B4xR+bMhlZzPZhR5FmcaUN7dwDvcz2fmQxhG6CLbi/HN64whgUHQljENVhOYTU6M++DZh7nZ+5UIdcL6uYYmjm+ySWxxr26viWAao5B7lsXxXNFnh01Df3YybA7uYcdnFsDGeRwPrKGzgA9TCXse0etD27eAHJuL/e3cz4hAqAmMsRyDT1nDub2yNo7tayI107xWUGRL+vdOMk8f3Dx1wOvm3Hx9EUJKAEloASUgBJQAkrgkASOKGCiZ4pxKobkBxu/yNPj6MrlEo3lpjEvoUhxjPeXfBTajoZRK9a1fJYIH3kXg9YIRWKCuF/yAWg4S9vRPAo2Sy+DeDkihquxNgp/l3AsKhx4mXlw57crMbEy3fBGSLsb1+zHfz+6l8nfXAOGx0o/EiYl+QYe9hPPMUmah4deAgmJks8yDjlO+pb5iREuX2QF9V4KDMoDY2wiquQ3HvqRTUSMDCv6u3yWNoy2+FHGIJ6JANtIpsEvla2kDHIsjXPpp2/wtySG0Em4m8xV2oz+JkJMwutksCySNSheIsOQMUfZRvYMeWUbdrbv/YBxRFCJABp6HeSM6HdhEWUeHb/0IZykH/kcHZ+cIyF0/1SsgYdFeUSvmbQvm7RhhK3xg9wndgqzOHpY5P6JzldEHb8ZzCX/5EOxFmnDOI48pbCAR7xRZBhPxSACW5iLmPKwbQkJTOD+Ph4nQxdhKJvcX9ExuHicfJby3TIGmRu1E1y8HnKujW0Iexm3zFXmI/d2iB962bccI/t7B+8nuZ+j97yMU75LRTqp4ib3nojb6FyF8YF8jAHqixJQAkpACSgBJaAElMARCRy1gImYgB+2J4bhgZsYdGLwiSEsxx94zIH7osbygcbcgccN7UeMQymXvJermJ9UlWCEHrW3ebGYC2jm02sTFSbRc+R46UfGJGMzDPKDiJED+zQMWjYiYzvwt2jb0fcj/f5PbfFgGdNQgSDnH8hA2j4Un6H9yucDOUd/l/doG1GBJfsOHO/hvg/9behno53BHQf2f+BxcuzQbeh9MnS/cJItyiby7aOv0WsavdeGHjG0baM9Du5g9+PQ46Lny7jlnCir6Dyi73JcpG/xOEUS/KWdD46XA7nJuGSLjjN670X2fpR/dL++KwEloASUgBJQAkpACRyZwFELmCM3dfyOEMNQnrY7WU43+sRcQtOMKmYHWtPHb1jakxJQAkpACSgBJaAElIASUAKfMoHDVyH7lDs/1ublCbeEUyUxNyOZa9JI6JWEM+mmBJSAElACSkAJKAEloASUwOebwL+lgIlekkjYlQqXKA99VwJKQAkoASWgBJSAElACn3cCg1kHn/dp6vyUgBJQAkpACSgBJaAElIAS+DwQUAHzebiKOgcloASUgBJQAkpACSgBJfAFIaAC5gtyoXWaSkAJKAEloASUgBJQAkrg80BABczn4SrqHJSAElACSkAJKAEloASUwBeEgAqYL8iF1mkqASWgBJSAElACSkAJKIHPAwGrrAivmxJQAkpACSgBJaAElIASUAJK4N+BgAkjX/ns1SEerD3tWQAAAExJREFUuvT5vwNFHaMSUAJK4ItIQP9b/UW86jpnJfDvS0D/m/WvvXafIH/T6rX1nz0B86/Fq70rASWgBJSAElACSkAJKAEl8Bkl8P8B+5xyTwal04UAAAAASUVORK5CYII=',
	    style: 'section', width: 565
		},  
    content: [],
    styles: {
        section: {
            fontSize: 9,
            color: '#FFFFFF',
            fillColor: '#2361AE',
            margin: [15, 15, 15, 100]
        },      
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      },
      titleHeader: {
        background: 'blue',
        color: 'white',
        position: 'absolute',

      }
    }};
    docDefinition.content.push({text: '\n\nBuilding Occupancies', style: 'subheader'});
    let table = {style: 'tableExample', table: {body:[[{text: 'Group', style: 'tableHeader', alignment: 'center'}, {text: 'Construction Type', style: 'tableHeader', alignment: 'center'}, {text: 'Construction Scope', style: 'tableHeader', alignment: 'center'},  {text: 'Square Feet', style: 'tableHeader', alignment: 'center'}]]}};
    this.cards.forEach(card => {
      if (card.building.group && card.construction.key && card.constructScope.name && card.squareFeet) {
        table.table.body.push([{text: card.building.group, style: '', alignment: 'left'}, {text: card.construction.key.toString(), style: '', alignment: 'left'}, {text: card.constructScope.name, style: '', alignment: 'left'}, {text: card.squareFeet.toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'right'}]);
      }
    });
    docDefinition.content.push(table);
    docDefinition.content.push({text: 'Fee Details', style: 'subheader'});
    table = {style: 'tableExample', table: {body:[[{text: 'Description', style: 'tableHeader', alignment: 'center'}, {text: 'Cost', style: 'tableHeader', alignment: 'center'}, {text: 'Technology Fee', style: 'tableHeader', alignment: 'center'}, {text: 'Total', style: 'tableHeader', alignment: 'center'}]]}};
    table.table.body.push([{text: 'Valuation', style: '', alignment: 'left'}, {text: '$' + Math.ceil(this.calculations.valuation).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'right'}, {text: '--', style: '', alignment: 'center'}, {text: '--', style: '', alignment: 'center'}]);
    table.table.body.push([{text: 'Building Permit', style: '', alignment: 'left'}, {text: '$' + (this.calculations.building.value).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'right'}, {text: '$' + this.calculations.building.tech.toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}, {text: '$' + (this.calculations.building.value + this.calculations.building.tech).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}]);
    table.table.body.push([{text: 'Electrical Permit', style: '', alignment: 'left'}, {text: '$' + (this.calculations.electrical.value).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'right'}, {text: '$' + this.calculations.electrical.tech.toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}, {text: '$' + (this.calculations.electrical.value + this.calculations.electrical.tech).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}]);
    table.table.body.push([{text: 'Mechanical Permit', style: '', alignment: 'left'}, {text: '$' + (this.calculations.mechanical.value).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'right'}, {text: '$' + this.calculations.mechanical.tech.toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}, {text: '$' + (this.calculations.mechanical.value + this.calculations.mechanical.tech).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}]);
    table.table.body.push([{text: 'Plumbing Permit', style: '', alignment: 'left'}, {text: '$' + (this.calculations.plumbing.value).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'right'}, {text: '$' + this.calculations.plumbing.tech.toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}, {text: '$' + (this.calculations.plumbing.value + this.calculations.plumbing.tech).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}]);
    table.table.body.push([{text: 'Plan Review', style: '', alignment: 'left'}, {text: '$' + (this.calculations.review.value).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'right'}, {text: '$' + this.calculations.review.tech.toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}, {text: '$' + (this.calculations.review.value + this.calculations.review.tech).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}]);
    table.table.body.push([{text: 'Total', style: 'tableHeader', alignment: 'left'}, {text: '--', style: 'tableHeader', alignment: 'right'}, {text: '--', style: '', alignment: 'center'}, {text: '$' + (this.calculations.building.value + this.calculations.building.tech + this.calculations.electrical.value + this.calculations.electrical.tech+this.calculations.mechanical.value + this.calculations.mechanical.tech+this.calculations.plumbing.value + this.calculations.plumbing.tech +this.calculations.review.value + this.calculations.review.tech).toLocaleString(undefined, {minimumFractionDigits:0}), style: '', alignment: 'center'}]);
    docDefinition.content.push(table);
    pdfmake.createPdf(docDefinition).download();
  }
  // calcTechAdder(calculations: Calculations) : Calculations {
  //   calculations.techFee = calculations.building * 0.04;
  //   calculations.building += calculations.techFee;
  //   return calculations;
  // }
}
