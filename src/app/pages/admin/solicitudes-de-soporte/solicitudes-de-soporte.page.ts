import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { solicitudSoporte } from 'src/app/models/soporte/soporte.models';
import { SoporteService } from 'src/app/services/soporte/soporte.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { AlertController } from '@ionic/angular';
import { ModalImagenesComponent } from 'src/app/components/admin/modal-imagenes/modal-imagenes.component';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-solicitudes-de-soporte',
  templateUrl: './solicitudes-de-soporte.page.html',
  styleUrls: ['./solicitudes-de-soporte.page.scss'],
  standalone: false
})
export class SolicitudesDeSoportePage implements OnInit {
  solicitudSoporte: (solicitudSoporte & { autorNombre?: string, autorEmail?: string })[] = [];

  constructor(private navCtrl: NavController,
              private soporteService: SoporteService,
              private ionicService: IonicService,
              private alertController: AlertController,
              private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.cargarSolicitudesDeSoportePendientes();
  }

  async cargarSolicitudesDeSoportePendientes() {
    try {
      const [solicitudes, usuarios] = await Promise.all([
        this.soporteService.obtenerSolicitudesPendientes(),
        this.soporteService.obtenerUsuarios()
      ]);

      this.solicitudSoporte = solicitudes.map((solicitud) => {
        const autor = usuarios.find(u => u.id === solicitud.usuarioId);
        return {
          ...solicitud,
          autorNombre: autor?.nombre || 'Desconocido',
          autorEmail: autor?.email || 'Desconocido'
        };
      });

    } catch (error) {
      console.error('Error al cargar solicitudes o usuarios:', error);
      this.ionicService.mostrarToastAbajo('Error al cargar solicitudes');
    }
  }

aprobarSolicitud(solicitud: solicitudSoporte) {
  if (!solicitud.id) return;
  this.soporteService.actualizarSolicitud(solicitud.id, { estado: 'resuelto' })
    .then(() => {
      this.ionicService.mostrarToastAbajo('Solicitud resuelta');
      this.cargarSolicitudesDeSoportePendientes(); 
    })
    .catch(() => this.ionicService.mostrarToastAbajo('Error al aprobar solicitud'));
}

async rechazarSolicitud(solicitud: solicitudSoporte) {
  const alert = await this.alertController.create({
    header: 'Rechazar solicitud',
    subHeader: 'Motivo del rechazo',
    inputs: [
      {
        name: 'justificacion',
        type: 'textarea',
        placeholder: 'Ingresa el motivo del rechazo',
      }
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Rechazar',
        handler: async (data) => {
          if (!data.justificacion || data.justificacion.trim() === '') {
            this.ionicService.mostrarToastAbajo('Debes ingresar un motivo para rechazar.');
            return false; 
          }

          try {
            await this.soporteService.actualizarSolicitud(solicitud['id']!, {
              estado: 'rechazado',
              justificacion: data.justificacion.trim()
            });
            this.ionicService.mostrarToastAbajo('Solicitud rechazada correctamente.');
            this.cargarSolicitudesDeSoportePendientes(); 
            return true;
          } catch (error) {
            console.error(error);
            this.ionicService.mostrarToastAbajo('Error al rechazar la solicitud.');
            return false;
          }
        }
      }
    ]
  });

  await alert.present();
}

async verImagenes(solicitud: solicitudSoporte) {

  if (!solicitud.imagenes || solicitud.imagenes.length === 0) return;

  const modal = await this.modalCtrl.create({
    component: ModalImagenesComponent,
    componentProps: {
      imagenes: solicitud.imagenes
    }
  });

  await modal.present();
}

  volverAtras() {
    this.navCtrl.back();
  }

}
