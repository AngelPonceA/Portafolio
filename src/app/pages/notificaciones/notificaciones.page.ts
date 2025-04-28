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
  notificacionExpandida: string | null = null;

  constructor( private authService : AuthService) { }

  async ngOnInit() {
      this.notificaciones = await this.authService.obtenerNotificaciones();
  }

  async abrirNotificacion(id: string) {
    try {
      await this.authService.actualizarEstadoNotificacion(id, 'vista');
      const notificacion = this.notificaciones?.find(n => n.id === id);
      if (notificacion) {
        notificacion.estado = 'vista';
      }
      this.notificacionExpandida = this.notificacionExpandida === id ? null : id;
    } catch (error) {
      console.error('Error al marcar la notificación como vista:', error);
    }
  }

  async eliminarNotificacion(id: string) {
    try {
      await this.authService.actualizarEstadoNotificacion(id, 'eliminada');
      this.notificaciones = this.notificaciones?.filter(n => n.id !== id);
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
    }
  }

}
