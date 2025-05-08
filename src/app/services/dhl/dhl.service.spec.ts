import { TestBed } from '@angular/core/testing';

import { DhlService } from './dhl.service';

describe('DhlService', () => {
  let service: DhlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DhlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
