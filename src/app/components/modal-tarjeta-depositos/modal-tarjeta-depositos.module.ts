import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalTarjetaDepositosComponent } from './modal-tarjeta-depositos.component';

@NgModule({
  declarations: [ModalTarjetaDepositosComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  exports: [ModalTarjetaDepositosComponent]
})
export class ModalConversionVendedorModule {}