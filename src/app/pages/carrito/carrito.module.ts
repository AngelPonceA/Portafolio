import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CarritoPage } from './carrito.page';
import { CarritoPageRoutingModule } from './carrito-routing.module';
import { ModalBoletaComponent } from 'src/app/components/modal-boleta/modal-boleta.component';
import { ModalFormNuevaDireccionComponent } from 'src/app/components/modal-form-nueva-direccion/modal-form-nueva-direccion.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarritoPageRoutingModule,
    ModalBoletaComponent,
    ModalFormNuevaDireccionComponent
  ],
declarations: [CarritoPage],
})

export class CarritoPageModule {}
