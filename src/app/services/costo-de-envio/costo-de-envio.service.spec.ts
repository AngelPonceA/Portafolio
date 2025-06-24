import { TestBed } from '@angular/core/testing';

import { CostoDeEnvioService } from './costo-de-envio.service';

describe('CostoDeEnvioService', () => {
  let service: CostoDeEnvioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostoDeEnvioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
