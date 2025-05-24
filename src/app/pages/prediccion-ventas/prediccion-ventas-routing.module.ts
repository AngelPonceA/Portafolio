import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrediccionVentasPage } from './prediccion-ventas.page';

const routes: Routes = [
  {
    path: '',
    component: PrediccionVentasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrediccionVentasPageRoutingModule {}
