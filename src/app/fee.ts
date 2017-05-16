export class Fee {
    constructor(name: string, value:number, commercial: number, residential: number, tech?: number) {
        this.name = name;
        this.value = value;
        this.commercial = commercial;
        this.residential = residential;
        this.tech = tech;
    }
    name: string;
    value: number;
    commercial: number;
    residential: number;
    tech: number;
}
