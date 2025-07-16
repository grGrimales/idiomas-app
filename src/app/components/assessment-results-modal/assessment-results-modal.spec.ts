import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentResultsModal } from './assessment-results-modal';

describe('AssessmentResultsModal', () => {
  let component: AssessmentResultsModal;
  let fixture: ComponentFixture<AssessmentResultsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentResultsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentResultsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
