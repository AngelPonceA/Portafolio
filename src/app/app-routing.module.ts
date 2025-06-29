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
    path: 'prediccion-ventas',
    loadChildren: () => import('./pages/prediccion-ventas/prediccion-ventas.module').then( m => m.PrediccionVentasPageModule)
  },
  {
    path: 'soporte',
    loadChildren: () => import('./pages/soporte/soporte/soporte.module').then( m => m.SoportePageModule)
  },
  {
    path: 'reporte',
    loadChildren: () => import('./pages/soporte/reporte/reporte.module').then( m => m.ReportePageModule)
  },
  {
    path: 'admin-menu',
    loadChildren: () => import('./pages/admin/admin-menu/admin-menu.module').then( m => m.AdminMenuPageModule)
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./pages/admin/usuarios/usuarios.module').then( m => m.UsuariosPageModule)
  },
  {
    path: 'solicitudes-de-soporte',
    loadChildren: () => import('./pages/admin/solicitudes-de-soporte/solicitudes-de-soporte.module').then( m => m.SolicitudesDeSoportePageModule)
  },
  {
    path: 'mis-solicitudes-de-soporte',
    loadChildren: () => import('./pages/mis-solicitudes-de-soporte/mis-solicitudes-de-soporte.module').then( m => m.MisSolucitudesDeSoportePageModule)
  },
  {
    path: 'tienda',
    loadChildren: () => import('./pages/tienda/tienda.module').then( m => m.TiendaPageModule)
  },  {
    path: 'reportes-de-usuarios',
    loadChildren: () => import('./pages/admin/reportes-de-usuarios/reportes-de-usuarios.module').then( m => m.ReportesDeUsuariosPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
