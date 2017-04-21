import { Injectable } from '@angular/core';
import { Http, Response }          from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Tier } from './tier';
@Injectable()
export class TiersService {

  constructor(private http: Http) { }
  getTiers(): Observable<Array<Tier>> {
    return this.http
               .get('./assets/tiers.json')
               .map((res:Response) => this.setTiers(res));
  }

  setTiers(res: Response): Array<Tier> {
    // let multiplier = 0.00077944778071331;
    // let recovery = 1;
    let tiers = res.json();
    //tiers.forEach(function (tier, i) {
       // tier.costper = ((multiplier * 1000) * tier.percent) * recovery;
    //     if (i === 0) {
    //       tier.cumulative = (tier.max / 1000) * tier.costper;
    //     } else if (i === tiers.length - 1){
    //       tier.cumulative = null;
    //     }else {
    //       tier.cumulative = (((tier.max - tier.min) / 1000) * tier.costper) + tiers[i - 1]['cumulative'];
    //     }
    //     console.log(tier);
    // });
    return tiers;
  }
}
