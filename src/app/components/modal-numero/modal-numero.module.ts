import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalNumeroComponent } from './modal-numero.component';

@NgModule({
  declarations: [ModalNumeroComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  exports: [ModalNumeroComponent]
})
export class ModalNumeroModule {}