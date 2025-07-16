import { TestBed } from '@angular/core/testing';

import { Ingles } from './ingles';

describe('Ingles', () => {
  let service: Ingles;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ingles);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
