import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitudesDeSoportePage } from './solicitudes-de-soporte.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitudesDeSoportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitudesDeSoportePageRoutingModule {}
