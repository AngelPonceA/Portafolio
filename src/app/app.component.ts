import { Component, OnInit } from '@angular/core';
import { TriggersService } from './services/triggers/triggers.service';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { CarritoService } from './services/carrito/carrito.service';
import { NavController, Platform } from '@ionic/angular';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  MostrarBotonSoporte = false;

  sesionValida = false;

  constructor(private triggersService: TriggersService, 
              private router: Router, 
              private authService: AuthService,
              private cartService: CarritoService, 
              private navCtrl: NavController,
              private platform: Platform
  ) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Al agregarse aquí la ruta se asegura que no se muestre este botón de manera permanente.
        const excludedRoutes = [
          '/ingreso',
          '/registro',
          '/home',
          '/soporte',
          '/mis-productos',
          '/carrito',
          '/perfil',
          '/admin',
          '/solicitudes-de-soporte',
          '/usuarios'
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
    
    this.triggersService.escucharCambiosPedido();

    this.triggersService.escucharCambiosDetallePedido();

    this.triggersService.escucharCambiosStock();

    this.triggersService.escucharCreacionPedido();

    try {
      const sesion = await this.authService.obtenerSesion();
      this.sesionValida = !!sesion && sesion.id !== 0;
      
    } catch (error) {
      this.sesionValida = false;
    }

    const rutaActual = this.router.url;
    const rutasExcluidas = ['/ingreso', '/registro', '/soporte', '/home', '/mis-productos','/carrito'];
    const estaExcluida = rutasExcluidas.includes(rutaActual);

    this.MostrarBotonSoporte = this.sesionValida && !estaExcluida;

    CapacitorApp.addListener('appUrlOpen', (event) => {
      const url = new URL(event.url);
      const token = url.searchParams.get('token_ws');

      // Acá tenemos que poner las direcciones a las que van los tokens para los pagos
      if (token) {
        console.log('Token recibido:', token);
        if (this.router.url.startsWith('/carrito')) {
          this.navCtrl.navigateRoot(['/carrito'], { queryParams: { token_ws: token } });
        } else if (this.router.url.startsWith('/perfil')) {
          this.navCtrl.navigateRoot(['/perfil'], { queryParams: { token_ws: token } });
        }
      }
    });

    this.platform.ready().then(() => {
      StatusBar.setOverlaysWebView({ overlay: false }); 
      StatusBar.setStyle({ style: Style.Dark }); 
      StatusBar.setBackgroundColor({ color: '#d1a15a' }); 
    });


  }
}

