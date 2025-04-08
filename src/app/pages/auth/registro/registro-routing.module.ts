import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroPage } from './registro.page';  // Importa el componente standalone

const routes: Routes = [
  {
    path: '',
    component: RegistroPage  // Usamos el componente directamente aquí
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],  // Configuramos las rutas
  exports: [RouterModule]
})
export class RegistroPageRoutingModule {}
