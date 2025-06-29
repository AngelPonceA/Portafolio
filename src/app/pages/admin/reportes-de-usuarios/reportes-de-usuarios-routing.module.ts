import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportesDeUsuariosPage } from './reportes-de-usuarios.page';

const routes: Routes = [
  {
    path: '',
    component: ReportesDeUsuariosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesDeUsuariosPageRoutingModule {}
