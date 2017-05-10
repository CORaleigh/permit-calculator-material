export class Fee {
    constructor(name: string, value:number, commercial: number, residential: number, waive?: boolean) {
        this.name = name;
        this.value = value;
        this.commercial = commercial;
        this.residential = residential;
        this.waive = waive;
    }
    name: string;
    value: number;
    commercial: number;
    residential: number;
    waive: boolean = false;
}
