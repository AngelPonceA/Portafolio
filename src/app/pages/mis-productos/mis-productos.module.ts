// src/app/pages/mis-productos/mis-productos.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MisProductosPage } from './mis-productos.page';
import { NavegacionComponent } from 'src/app/components/navegacion/navegacion.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MisProductosPageRoutingModule } from './mis-productos-routing.module';
import { ModalAgregarProductoComponent } from 'src/app/components/mis-productos/modal-agregar-producto/modal-agregar-producto.component';
import { ModalEditarProductoComponent } from 'src/app/components/mis-productos/modal-editar-producto/modal-editar-producto.component';
import { ModalAlertaStockComponent } from 'src/app/components/mis-productos/modal-alerta-stock/modal-alerta-stock.component';
import { ModalOfertaComponent } from 'src/app/components/mis-productos/modal-oferta/modal-oferta.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisProductosPageRoutingModule,
    NavegacionComponent,
    ModalAgregarProductoComponent,
    ModalEditarProductoComponent,
    ModalOfertaComponent,
    ModalAlertaStockComponent
  ],
  declarations: [MisProductosPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MisProductosPageModule {}