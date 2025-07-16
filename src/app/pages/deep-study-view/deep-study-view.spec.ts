import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeepStudyView } from './deep-study-view';

describe('DeepStudyView', () => {
  let component: DeepStudyView;
  let fixture: ComponentFixture<DeepStudyView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeepStudyView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeepStudyView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
