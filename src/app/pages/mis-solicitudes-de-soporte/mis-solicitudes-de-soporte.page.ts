import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SoporteService } from 'src/app/services/soporte/soporte.service';
import { solicitudSoporte } from '../../models/soporte/soporte.models';

@Component({
  selector: 'app-mis-solicitudes-de-soporte',
  templateUrl: './mis-solicitudes-de-soporte.page.html',
  styleUrls: ['./mis-solicitudes-de-soporte.page.scss'],
  standalone: false,
})
export class MisSolicitudesDeSoportePage implements OnInit {

  solicitudes: solicitudSoporte[] = [];
  usuario: any;
  constructor(
              private soporteService: SoporteService,
              private authService: AuthService,
              private navCtrl: NavController
  ) { }

  async ngOnInit() {
    this.usuario = await this.authService.obtenerPerfil();
    if (this.usuario) {
      this.solicitudes = await this.soporteService.obtenerSolicitudesPorUsuario(this.usuario.id);
      console.log('Solicitudes obtenidas:', this.solicitudes);
    }
    
  }

  volverAtras() {
    this.navCtrl.back();
  }
}
