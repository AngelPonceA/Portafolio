import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioVendedorPage } from './usuario-vendedor.page';

const routes: Routes = [
  {
    path: '',
    component: UsuarioVendedorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioVendedorPageRoutingModule {}
