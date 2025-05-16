import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminMenuPageRoutingModule } from './admin-menu-routing.module';

import { AdminMenuPage } from './admin-menu.page';
import { NavegacionComponent } from 'src/app/components/navegacion/navegacion.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminMenuPageRoutingModule,
    NavegacionComponent
  ],
  declarations: [AdminMenuPage]
})
export class AdminMenuPageModule {}
