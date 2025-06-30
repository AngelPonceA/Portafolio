import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilPageRoutingModule } from './perfil-routing.module';
import { PerfilPage } from './perfil.page';

// Importar acá abajo para no confundirnos
import { NavegacionComponent } from "../../components/navegacion/navegacion.component";
import { ModalTarjetaDepositosComponent } from 'src/app/components/modal-tarjeta-depositos/modal-tarjeta-depositos.component';
import { ModalNumeroComponent } from 'src/app/components/modal-numero/modal-numero.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    NavegacionComponent,
  ],
  declarations: [PerfilPage, 
                ModalTarjetaDepositosComponent,
                ModalNumeroComponent],
})
export class PerfilPageModule {}
