import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalConsentimientoInformadoComponent } from './modal-consentimiento.informado.component';

@NgModule({
  declarations: [ModalConsentimientoInformadoComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  exports: [ModalConsentimientoInformadoComponent]
})
export class ModalConsentimientoInformadoModule{}
