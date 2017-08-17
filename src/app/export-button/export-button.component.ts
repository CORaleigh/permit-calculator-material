import {
  Component,
  Input,
  OnInit
} from '@angular/core';
import {
  Calculations
} from '../calculations';
import {
  DevelopmentCard
} from '../development-card';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
@Component({
  selector: 'app-export-button',
  inputs: ['cards', 'calculations', 'project'],
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.css']
})
export class ExportButtonComponent implements OnInit {
  constructor() {}
  @Input() cards: Array < DevelopmentCard > ;
  @Input() project: any;
  @Input() calculations: Calculations;
  ngOnInit() {}
  exportPdf() {
    pdfmake.vfs = pdfFonts.pdfMake.vfs;

    var docDefinition = {
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
          margin: [0, 40, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        subheader2: {
          fontSize: 12,
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
          bold: true,
          color: 'white',
          fontSize: 18
        }
      }
    };
    docDefinition.content.push({
      canvas: [{
        type: 'rect',
        x: 0,
        y: 0,
        w: 500,
        h: 100,
        // lineWidth: 10,
        color: '#3f51b5'
      }]
    });

    docDefinition.content.push({
      text: 'City of Raleigh',
      style: 'titleHeader',
      absolutePosition: {
        x: 120,
        y: 65
      }
    });
    docDefinition.content.push({
      height: 50,
      width: 50,
      absolutePosition: {
        x: 50,
        y: 65
      },
      image: 'data:image/png;base64,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'
    });
    docDefinition.content.push({
      text: 'Building and Trade Permit Calculator',
      style: 'titleHeader',
      absolutePosition: {
        x: 120,
        y: 90
      }
    });
    docDefinition.content.push({
      text: 'Project Details',
      style: 'subheader'
    });
    if (this.project.name.length > 0) {
      docDefinition.content.push({
        text: 'Project Name',
        style: 'subheader2'
      });
      docDefinition.content.push({
        text: this.project.name
      });
    }
    if (this.project.address.length > 0) {
      docDefinition.content.push({
        text: 'Project Address',
        style: 'subheader2'
      });
      docDefinition.content.push({
        text: this.project.address
      });
    }
    docDefinition.content.push({
      text: 'Valuation',
      style: 'subheader2'
    });
    docDefinition.content.push({
      text: '$' + Math.ceil(this.calculations.valuation).toLocaleString(undefined, {
        minimumFractionDigits: 0
      })
    });


    docDefinition.content.push({
      text: 'Building Occupancies',
      style: 'subheader'
    });
    let table = {
      style: 'tableExample',
      table: {
        body: [
          [{
            text: 'Group',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#eeeeee'
          }, {
            text: 'Construction Type',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#eeeeee'
          }, {
            text: 'Construction Scope',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#eeeeee'
          }, {
            text: 'Square Feet',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#eeeeee'
          }]
        ]
      }
    };
    this.cards.forEach(card => {
      if (card.building.group && card.construction.key && card.constructScope.name && card.squareFeet) {
        table.table.body.push([{
          text: card.building.group,
          style: '',
          alignment: 'left',
          fillColor: ''
        }, {
          text: card.construction.key.toString(),
          style: '',
          alignment: 'left',
          fillColor: ''
        }, {
          text: card.constructScope.name,
          style: '',
          alignment: 'left',
          fillColor: ''
        }, {
          text: card.squareFeet.toLocaleString(undefined, {
            minimumFractionDigits: 0
          }),
          style: '',
          alignment: 'right',
          fillColor: ''
        }]);
      }
    });

    docDefinition.content.push(table);
    docDefinition.content.push({
      text: 'Fee Details',
      style: 'subheader'
    });
    table = {
      style: 'tableExample',
      table: {
        body: [
          [{
            text: 'Description',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#eeeeee'
          }, {
            text: 'Cost',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#eeeeee'
          }, {
            text: 'Technology Fee',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#eeeeee'
          }, {
            text: 'Total',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#eeeeee'
          }]
        ]
      }
    };
    table.table.body.push([{
      text: 'Building Permit',
      style: '',
      alignment: 'left',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.building.value).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + this.calculations.building.tech.toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.building.value + this.calculations.building.tech).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: 'tableHeader',
      alignment: 'right',
      fillColor: '#cccccc'
    }]);
    table.table.body.push([{
      text: 'Electrical Permit',
      style: '',
      alignment: 'left',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.electrical.value).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + this.calculations.electrical.tech.toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.electrical.value + this.calculations.electrical.tech).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: 'tableHeader',
      alignment: 'right',
      fillColor: '#cccccc'
    }]);
    table.table.body.push([{
      text: 'Mechanical Permit',
      style: '',
      alignment: 'left',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.mechanical.value).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + this.calculations.mechanical.tech.toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.mechanical.value + this.calculations.mechanical.tech).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: 'tableHeader',
      alignment: 'right',
      fillColor: '#cccccc'
    }]);
    table.table.body.push([{
      text: 'Plumbing Permit',
      style: '',
      alignment: 'left',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.plumbing.value).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + this.calculations.plumbing.tech.toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.plumbing.value + this.calculations.plumbing.tech).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: 'tableHeader',
      alignment: 'right',
      fillColor: '#cccccc'
    }]);
    table.table.body.push([{
      text: 'Plan Review',
      style: '',
      alignment: 'left',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.review.value).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + this.calculations.review.tech.toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: '',
      alignment: 'right',
      fillColor: ''
    }, {
      text: '$' + (this.calculations.review.value + this.calculations.review.tech).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: 'tableHeader',
      alignment: 'right',
      fillColor: '#cccccc'
    }]);
    table.table.body.push([{
      text: 'Total',
      style: 'tableHeader',
      alignment: 'left',
      fillColor: '#cccccc'
    }, {
      text: '$' + (this.calculations.building.value + this.calculations.electrical.value + this.calculations.mechanical.value + this.calculations.plumbing.value + this.calculations.review.value).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: 'tableHeader',
      alignment: 'right',
      fillColor: '#cccccc'
    }, {
      text: '$' + (this.calculations.building.tech + this.calculations.electrical.tech + this.calculations.mechanical.tech + this.calculations.plumbing.tech + this.calculations.review.tech).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: 'tableHeader',
      alignment: 'right',
      fillColor: '#cccccc'
    }, {
      text: '$' + (this.calculations.building.value + this.calculations.building.tech + this.calculations.electrical.value + this.calculations.electrical.tech + this.calculations.mechanical.value + this.calculations.mechanical.tech + this.calculations.plumbing.value + this.calculations.plumbing.tech + this.calculations.review.value + this.calculations.review.tech).toLocaleString(undefined, {
        minimumFractionDigits: 0
      }),
      style: 'tableHeader',
      alignment: 'right',
      fillColor: '#cccccc'
    }]);
    docDefinition.content.push(table);
    let file = (this.project.name) ? this.project.name : 'building-permit-fees.pdf';
    pdfmake.createPdf(docDefinition).download(file);
  }
}