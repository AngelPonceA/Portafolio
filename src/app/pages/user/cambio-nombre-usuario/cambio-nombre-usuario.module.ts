import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CambioNombreUsuarioPageRoutingModule } from './cambio-nombre-usuario-routing.module';

import { CambioNombreUsuarioPage } from './cambio-nombre-usuario.page';
import { NavegacionComponent } from 'src/app/components/navegacion/navegacion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CambioNombreUsuarioPageRoutingModule,
    ReactiveFormsModule,
    NavegacionComponent
  ],
  declarations: [CambioNombreUsuarioPage]
})
export class CambioNombreUsuarioPageModule {}
