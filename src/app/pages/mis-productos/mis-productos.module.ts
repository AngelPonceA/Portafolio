import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MisProductosPageRoutingModule } from './mis-productos-routing.module';
import { MisProductosPage } from './mis-productos.page';
import { NavegacionComponent } from 'src/app/components/navegacion/navegacion.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisProductosPageRoutingModule,
    NavegacionComponent
  ],
  declarations: [MisProductosPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MisProductosPageModule {}
