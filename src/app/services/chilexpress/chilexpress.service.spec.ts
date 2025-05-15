import { TestBed } from '@angular/core/testing';

import { ChilexpressService } from './chilexpress.service';

describe('ChilexpressService', () => {
  let service: ChilexpressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChilexpressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
