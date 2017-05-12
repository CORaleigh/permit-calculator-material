export class Fee {
    constructor(name: string, value:number, commercial: number, residential: number) {
        this.name = name;
        this.value = value;
        this.commercial = commercial;
        this.residential = residential;
    }
    name: string;
    value: number;
    commercial: number;
    residential: number;
}
