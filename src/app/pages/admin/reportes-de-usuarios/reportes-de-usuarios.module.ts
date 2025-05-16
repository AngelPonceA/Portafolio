import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportesDeUsuariosPageRoutingModule } from './reportes-de-usuarios-routing.module';

import { ReportesDeUsuariosPage } from './reportes-de-usuarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportesDeUsuariosPageRoutingModule
  ],
  declarations: [ReportesDeUsuariosPage]
})
export class ReportesDeUsuariosPageModule {}
