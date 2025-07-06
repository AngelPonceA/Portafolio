import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalConsentimientoInformadoComponent } from './modal-consentimiento.informado.component';

describe('ModalConsentimientoInformadoComponent', () => {
  let component: ModalConsentimientoInformadoComponent;
  let fixture: ComponentFixture<ModalConsentimientoInformadoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConsentimientoInformadoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConsentimientoInformadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
