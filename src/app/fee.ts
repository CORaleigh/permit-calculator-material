export class Fee {
    constructor(value:number, commercial: number, residential: number) {
        this.value = value;
        this.commercial = commercial;
        this.residential = residential;
    }
    value: number;
    commercial: number;
    residential: number;
}
