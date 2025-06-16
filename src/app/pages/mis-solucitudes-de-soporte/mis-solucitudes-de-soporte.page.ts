import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SoporteService } from 'src/app/services/soporte/soporte.service';
import { solicitudSoporte } from '../../../app/models/soporte/soporte.models';

@Component({
  selector: 'app-mis-solucitudes-de-soporte',
  templateUrl: './mis-solucitudes-de-soporte.page.html',
  styleUrls: ['./mis-solucitudes-de-soporte.page.scss'],
  standalone: false,
})
export class MisSolucitudesDeSoportePage implements OnInit {

  solicitudes: solicitudSoporte[] = [];

  constructor(
              private soporteService: SoporteService,
              private authService: AuthService,
              private navCtrl: NavController
  ) { }

  async ngOnInit() {
    // const sesion = await this.authService.obtenerSesion();
    // const uid = sesion?.id;

    const uid = "kCnjHs7m1fWHHnavK2qvv2lRy2L2"
    if (uid) {
      this.solicitudes = await this.soporteService.obtenerSolicitudesPorUsuario(uid);
      console.log('Solicitudes obtenidas:', this.solicitudes);
    }
  }

  volverAtras() {
    this.navCtrl.back();
  }
}
