import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepStudySetup } from './deep-study-setup';

describe('DeepStudySetup', () => {
  let component: DeepStudySetup;
  let fixture: ComponentFixture<DeepStudySetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeepStudySetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeepStudySetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
