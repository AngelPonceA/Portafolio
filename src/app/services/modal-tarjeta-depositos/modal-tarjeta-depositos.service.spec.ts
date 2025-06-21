import { TestBed } from '@angular/core/testing';

import { ModalTarjetaDepositosService } from './modal-tarjeta-depositos.service';

describe('ModalTarjetaDepositosService', () => {
  let service: ModalTarjetaDepositosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalTarjetaDepositosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
