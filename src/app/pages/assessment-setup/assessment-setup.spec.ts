import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentSetup } from './assessment-setup';

describe('AssessmentSetup', () => {
  let component: AssessmentSetup;
  let fixture: ComponentFixture<AssessmentSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
