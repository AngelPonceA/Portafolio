import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalTarjetaDepositosComponent } from './modal-tarjeta-depositos.component';

describe('ModalTarjetaDepositosComponent', () => {
  let component: ModalTarjetaDepositosComponent;
  let fixture: ComponentFixture<ModalTarjetaDepositosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTarjetaDepositosComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalTarjetaDepositosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
