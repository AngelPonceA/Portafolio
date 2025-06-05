import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalFormNuevaDireccionComponent } from './modal-form-nueva-direccion.component';

describe('ModalFormNuevaDireccionComponent', () => {
  let component: ModalFormNuevaDireccionComponent;
  let fixture: ComponentFixture<ModalFormNuevaDireccionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFormNuevaDireccionComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalFormNuevaDireccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
