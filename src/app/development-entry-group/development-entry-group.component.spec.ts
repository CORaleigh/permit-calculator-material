import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopmentEntryGroupComponent } from './development-entry-group.component';

describe('DevelopmentEntryGroupComponent', () => {
  let component: DevelopmentEntryGroupComponent;
  let fixture: ComponentFixture<DevelopmentEntryGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevelopmentEntryGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevelopmentEntryGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
