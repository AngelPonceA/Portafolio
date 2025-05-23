import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SolicitudesDeSoportePageRoutingModule } from './solicitudes-de-soporte-routing.module';
import { SolicitudesDeSoportePage } from './solicitudes-de-soporte.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolicitudesDeSoportePageRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [SolicitudesDeSoportePage]
})
export class SolicitudesDeSoportePageModule {}
