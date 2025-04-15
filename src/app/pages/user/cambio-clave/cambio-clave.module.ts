import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CambioClavePageRoutingModule } from './cambio-clave-routing.module';
import { CambioClavePage } from './cambio-clave.page';
import { NavegacionComponent } from 'src/app/components/navegacion/navegacion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CambioClavePageRoutingModule,
    ReactiveFormsModule,
    NavegacionComponent
  ],
  declarations: [CambioClavePage]
})
export class CambioClavePageModule {}
