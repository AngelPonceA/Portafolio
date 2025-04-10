import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarritoPage } from './carrito.page';

const routes: Routes = [
  {
    path: '',
    component: CarritoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarritoPageRoutingModule {}