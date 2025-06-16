import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisSolucitudesDeSoportePage } from './mis-solucitudes-de-soporte.page';

const routes: Routes = [
  {
    path: '',
    component: MisSolucitudesDeSoportePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisSolucitudesDeSoportePageRoutingModule {}
