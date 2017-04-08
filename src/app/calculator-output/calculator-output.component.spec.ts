import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalcuatorOutputComponent } from './calcuator-output.component';

describe('CalcuatorOutputComponent', () => {
  let component: CalcuatorOutputComponent;
  let fixture: ComponentFixture<CalcuatorOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalcuatorOutputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalcuatorOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
