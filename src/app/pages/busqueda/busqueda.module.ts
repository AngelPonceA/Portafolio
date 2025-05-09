import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BusquedaPageRoutingModule } from './busqueda-routing.module';

import { BusquedaPage } from './busqueda.page';
import { NavegacionComponent } from "../../components/navegacion/navegacion.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BusquedaPageRoutingModule,
    NavegacionComponent,
  ],
  declarations: [BusquedaPage]
})
export class BusquedaPageModule {}
