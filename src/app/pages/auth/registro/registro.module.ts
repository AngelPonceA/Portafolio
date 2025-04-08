import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { FormsModule } from '@angular/forms';  // Importa FormsModule para ngModel
import { IonicModule } from '@ionic/angular';   // Importa IonicModule
import { RegistroPageRoutingModule } from './registro-routing.module';  // Importa las rutas de RegistroPage
import { RegistroPage } from './registro.page'; // Importa el componente RegistroPage

@NgModule({
  imports: [
    CommonModule,
    FormsModule,  // Agrega FormsModule para usar ngModel
    IonicModule,  // Asegúrate de incluir IonicModule aquí
    RegistroPageRoutingModule,  // Importa las rutas de RegistroPage
  ]
})
export class RegistroPageModule {}