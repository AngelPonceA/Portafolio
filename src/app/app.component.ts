import { Component, OnInit } from '@angular/core';
import { TriggersService } from './services/triggers/triggers.service';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { CarritoService } from './services/carrito/carrito.service';
import { NavController } from '@ionic/angular';
import { App, URLOpenListener, URLOpenListenerEvent } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  MostrarBotonSoporte = false;

  // Cambiar a false cuando se lleve a producción
  sesionValida = true;

  constructor(
  private triggersService: TriggersService,
  private router: Router,
  private authService: AuthService,
  private cartService: CarritoService,
  private navCtrl: NavController
) {
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      // Al agregarse aquí la ruta se asegura que no se muestre este botón de manera permanente.
      const excludedRoutes = [
        '/ingreso',
        '/registro',
        '/home',
        '/soporte',
      ];
      const currentUrl = event.urlAfterRedirects;
      const rutaExcluida = excludedRoutes.includes(currentUrl);

      this.MostrarBotonSoporte = this.sesionValida && !rutaExcluida;
    }
  });
}

  async ngOnInit() {
    this.authService.comprobarSesion();

    this.cartService.comprobarCarrito();
    
    //   this.triggersService.escucharCambiosPedido();

    //   this.triggersService.escucharCambiosDetallePedido();

    //   this.triggersService.escucharCambiosStock();

    //   this.triggersService.escucharCreacionPedido();

    //   this.authService.comprobarSesion();

    try {
      // const sesion = await this.authService.obtenerSesion();
      // this.sesionValida = !!sesion && sesion.id !== 0;
      
      this.sesionValida = true // <=== Eliminar cuando se lleve a producción
    } catch (error) {
      this.sesionValida = false;
    }

    const rutaActual = this.router.url;
    const rutasExcluidas = ['/ingreso', '/registro', '/soporte', '/home'];
    const estaExcluida = rutasExcluidas.includes(rutaActual);

    this.MostrarBotonSoporte = this.sesionValida && !estaExcluida;

    window.addEventListener('webpayRedirect', (event: any) => {
      try {
        const token = event.token_ws;
        console.log('🎯 Token recibido en app.component.ts:', token);
        if (token) {
          this.navCtrl.navigateForward(['/carrito', token]);
        }
      } catch (e) {
        console.error('❌ Error procesando evento webpayRedirect'+JSON.stringify(event), e);
      }
    });

  }
}

