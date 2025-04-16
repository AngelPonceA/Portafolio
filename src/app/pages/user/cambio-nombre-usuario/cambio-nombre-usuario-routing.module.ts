import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CambioNombreUsuarioPage } from './cambio-nombre-usuario.page';

const routes: Routes = [
  {
    path: '',
    component: CambioNombreUsuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CambioNombreUsuarioPageRoutingModule {}
