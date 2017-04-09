import { Calculations } from './calculations';
export class DevelopmentCard {
    valuation: number;
    building: {group: string, values: Array<any>};
    construction: {key: string, value: number};
    constructScope: {name: string, percent: number};
    squareFeet: number;
    constructPercent: number;
    calculations: Calculations;
    cardindex: number;
}
