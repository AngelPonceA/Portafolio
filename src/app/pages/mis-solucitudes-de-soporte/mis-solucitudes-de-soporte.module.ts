import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MisSolucitudesDeSoportePageRoutingModule } from './mis-solucitudes-de-soporte-routing.module';

import { MisSolucitudesDeSoportePage } from './mis-solucitudes-de-soporte.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisSolucitudesDeSoportePageRoutingModule
  ],
  declarations: [MisSolucitudesDeSoportePage]
})
export class MisSolucitudesDeSoportePageModule {}
