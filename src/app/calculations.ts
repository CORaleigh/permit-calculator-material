import {Fee} from './fee';
import {Tier} from './tier';
export class Calculations {
    isResidential: boolean = false;
    valuation: number = 0;
    building: number = 0;
    review: Fee;
    electrical: Fee;
    plumbing: Fee;
    mechanical: Fee;
    total: number = 0;
    perValuation: number = 0;
    tiers: Array<Tier>;
}
