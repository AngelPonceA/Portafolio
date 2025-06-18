import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisSolicitudesDeSoportePage } from './mis-solicitudes-de-soporte.page';

const routes: Routes = [
  {
    path: '',
    component: MisSolicitudesDeSoportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisSolicitudesDeSoportePageRoutingModule {}
