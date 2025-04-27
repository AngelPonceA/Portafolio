import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: false
})
export class NotificacionesPage implements OnInit {

  notificaciones?: any[] = [];

  constructor( private authService : AuthService) { }

  async ngOnInit() {
      this.notificaciones = await this.authService.obtenerNotificaciones();
  }

  async eliminarNotificacion(id: string) {
  }

}
