import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'favoritos',
    loadChildren: () => import('./pages/favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  },
  {
    path: 'carrito',
    loadChildren: () => import('./pages/carrito/carrito.module').then( m => m.CarritoPageModule)
  },
  {
    path: 'producto',
    loadChildren: () => import('./pages/producto/producto.module').then( m => m.ProductoPageModule)
  },
  {
    path: 'busqueda',
    loadChildren: () => import('./pages/busqueda/busqueda.module').then( m => m.BusquedaPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/auth/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'ingreso',
    loadChildren: () => import('./pages/auth/ingreso/ingreso.module').then( m => m.IngresoPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./pages/notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
  {
    path: 'cambio-clave',
    loadChildren: () => import('./pages/user/cambio-clave/cambio-clave.module').then( m => m.CambioClavePageModule)
  },
  {
    path: 'cambio-nombre-usuario',
    loadChildren: () => import('./pages/user/cambio-nombre-usuario/cambio-nombre-usuario.module').then( m => m.CambioNombreUsuarioPageModule)
  },
  {
    path: 'recuperar-clave',
    loadChildren: () => import('./pages/auth/recuperar-clave/recuperar-clave.module').then( m => m.RecuperarClavePageModule)
  },
  {
    path: 'usuario-vendedor',
    loadChildren: () => import('./pages/usuario-vendedor/usuario-vendedor.module').then( m => m.UsuarioVendedorPageModule)
  },
  {
    path: 'mis-productos',
    loadChildren: () => import('./pages/mis-productos/mis-productos.module').then( m => m.MisProductosPageModule)
  },
  {
    path: 'historial-compra',
    loadChildren: () => import('./pages/historial-compra/historial-compra.module').then( m => m.HistorialCompraPageModule)
  },
  {
    path: 'historial-ventas',
    loadChildren: () => import('./pages/historial-ventas/historial-ventas.module').then( m => m.HistorialVentasPageModule)
  },
  {
    path: 'historial-compra',
    loadChildren: () => import('./pages/historial-compra/historial-compra.module').then( m => m.HistorialCompraPageModule)
  },
  {
    path: 'boleta',
    loadChildren: () => import('./pages/boleta/boleta.module').then( m => m.BoletaPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
