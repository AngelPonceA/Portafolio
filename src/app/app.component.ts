import { Component, OnInit } from '@angular/core';
import { TriggersService } from './services/triggers/triggers.service';
import { Router } from '@angular/router';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  MostrarBotonSoporte = false;
  constructor(
    private triggersService: TriggersService,
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.subscribe(() => {
      const excludedRoutes = [
        '/ingreso',
        '/registro'
      ];
    const currentUrl = this.router.url;
    
    this.MostrarBotonSoporte = !excludedRoutes.includes(currentUrl);
    });
  }

  ngOnInit() {
    this.triggersService.escucharCambiosPedido();

    this.triggersService.escucharCambiosDetallePedido();

    this.triggersService.escucharCambiosStock();

    this.triggersService.escucharCreacionPedido();
     this.authService.obtenerSesion().then(sesion => {
    if (sesion && sesion.id !== 0) {
      this.MostrarBotonSoporte = true;
    } else {
      this.MostrarBotonSoporte = false;
    }
  });

  }
}
