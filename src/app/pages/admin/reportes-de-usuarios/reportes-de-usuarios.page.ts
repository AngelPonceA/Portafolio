import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SoporteService } from 'src/app/services/soporte/soporte.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { AlertController } from '@ionic/angular';
import { reporte } from 'src/app/models/soporte/reporte.models';
import { ModalController } from '@ionic/angular';
import { ModalImagenesComponent } from 'src/app/components/admin/modal-imagenes/modal-imagenes.component';

@Component({
  selector: 'app-reportes-de-usuarios',
  templateUrl: './reportes-de-usuarios.page.html',
  styleUrls: ['./reportes-de-usuarios.page.scss'],
  standalone:false
})
export class ReportesDeUsuariosPage implements OnInit {
  reporte: (reporte & { autorNombre?: string, autorEmail?: string })[] = []

  constructor(private navCtrl: NavController,
              private soporteService: SoporteService,
              private ionicService: IonicService,
              private alertController: AlertController,
              private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.cargarReportesdeUsuarioPendientes();
  }

  async cargarReportesdeUsuarioPendientes(){
    try {
      const [reportes, usuarios] = await Promise.all([
        this.soporteService.ObtenerReportesPendientes(),
        this.soporteService.obtenerUsuarios()
      ]);

      this.reporte = reportes.map((reporte) => {
        const autor = usuarios.find(u => u.id === reporte.usuarioId);
        return{
          ...reporte,
          autorNombre: autor?.nombre || 'Desconocido',
          autorEmail: autor?.email || 'Desconocido'
        }
      })

    } catch (error) {
      console.error('Error al cargar solicitudes o usuarios:', error);
      this.ionicService.mostrarToastAbajo('Error al cargar solicitudes');
    }
  }

  volverAtras() {
    this.navCtrl.back();
  }

  aprobarReporte(reporte: reporte){
    if (!reporte.id) return;
    this.soporteService.actualizarReporte(reporte.id, { estado: 'resuelto'})
      .then(() => {
        this.ionicService.mostrarToastAbajo('Reporte resuelto');
        this,this.cargarReportesdeUsuarioPendientes();
      })
      .catch(() => this.ionicService.mostrarToastAbajo('Error al aprobar reporte'));
  }

async verImagenes(reporte: reporte) {

  if (!reporte.imagenes || reporte.imagenes.length === 0) return;

  const modal = await this.modalCtrl.create({
    component: ModalImagenesComponent,
    componentProps: {
      imagenes: reporte.imagenes
    }
  });

  await modal.present();
}

  async rechazarReporte(reporte: reporte){
  const alert = await this.alertController.create({
    header: 'Rechazar reporte',
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
            await this.soporteService.actualizarReporte(reporte['id']!, {
              estado: 'rechazado',
              justificacionRespuesta: data.justificacion.trim()
            });
            this.ionicService.mostrarToastAbajo('Solicitud rechazada correctamente.');
            this.cargarReportesdeUsuarioPendientes(); 
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
}
