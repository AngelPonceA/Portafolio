import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrediccionVentasPageRoutingModule } from './prediccion-ventas-routing.module';

import { PrediccionVentasPage } from './prediccion-ventas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrediccionVentasPageRoutingModule
  ],
  declarations: [PrediccionVentasPage]
})
export class PrediccionVentasPageModule {}
