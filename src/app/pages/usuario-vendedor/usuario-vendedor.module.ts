import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioVendedorPageRoutingModule } from './usuario-vendedor-routing.module';

import { UsuarioVendedorPage } from './usuario-vendedor.page';
import { NavegacionComponent } from 'src/app/components/navegacion/navegacion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioVendedorPageRoutingModule,
    NavegacionComponent
  ],
  declarations: [UsuarioVendedorPage]
})
export class UsuarioVendedorPageModule {}
