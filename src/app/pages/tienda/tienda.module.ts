import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TiendaPageRoutingModule } from './tienda-routing.module';

import { TiendaPage } from './tienda.page';
import { NavegacionComponent } from "../../components/navegacion/navegacion.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TiendaPageRoutingModule,
    NavegacionComponent
  ],
  declarations: [TiendaPage]
})
export class TiendaPageModule {}
