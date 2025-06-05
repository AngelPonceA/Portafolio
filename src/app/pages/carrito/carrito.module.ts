import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CarritoPage } from './carrito.page';
import { CarritoPageRoutingModule } from './carrito-routing.module';
import { ModalBoletaComponent } from 'src/app/components/modal-boleta/modal-boleta.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarritoPageRoutingModule,
    ModalBoletaComponent
  ],
declarations: [CarritoPage],
})

export class CarritoPageModule {}
