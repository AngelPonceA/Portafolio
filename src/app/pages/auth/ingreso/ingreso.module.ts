import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IngresoPageRoutingModule } from './ingreso-routing.module';
import { IngresoPage } from './ingreso.page';
import { NavegacionComponent } from 'src/app/components/navegacion/navegacion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresoPageRoutingModule,
    NavegacionComponent
  ],
  declarations: [IngresoPage]
})

export class IngresoPageModule {}