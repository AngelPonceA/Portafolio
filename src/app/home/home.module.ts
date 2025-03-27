import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';

//Acá abajo los imports, para no confundirnos
import { NavegacionComponent } from '../components/navegacion/navegacion.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    NavegacionComponent
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
