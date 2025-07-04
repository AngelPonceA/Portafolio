import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TerminosYCondicionesPageRoutingModule } from './terminos-ycondiciones-routing.module';

import { TerminosYCondicionesPage } from './terminos-ycondiciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TerminosYCondicionesPageRoutingModule
  ],
  declarations: [TerminosYCondicionesPage]
})
export class TerminosYCondicionesPageModule {}
