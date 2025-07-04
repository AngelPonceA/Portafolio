import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MisSolicitudesDeSoportePageRoutingModule } from './mis-solicitudes-de-soporte-routing.module';

import { MisSolicitudesDeSoportePage } from './mis-solicitudes-de-soporte.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisSolicitudesDeSoportePageRoutingModule
  ],
  declarations: [MisSolicitudesDeSoportePage]
})
export class MisSolucitudesDeSoportePageModule {}
