import { NgModule } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 import { IonicModule } from '@ionic/angular';
 import { RegistroPageRoutingModule } from './registro-routing.module';
 import { RegistroPage } from './registro.page';
 import { NavegacionComponent } from 'src/app/components/navegacion/navegacion.component';

 @NgModule({
   imports: [
     CommonModule,
     FormsModule,
     IonicModule,
     RegistroPageRoutingModule,
     NavegacionComponent,
     ReactiveFormsModule
   ],
   declarations: [RegistroPage]
 })
 export class RegistroPageModule {}