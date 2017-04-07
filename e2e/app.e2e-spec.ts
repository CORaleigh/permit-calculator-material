import { PermitCalculatorMaterialPage } from './app.po';

describe('permit-calculator-material App', () => {
  let page: PermitCalculatorMaterialPage;

  beforeEach(() => {
    page = new PermitCalculatorMaterialPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
