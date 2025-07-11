import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/models/usuario.models';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { SoporteService } from 'src/app/services/soporte/soporte.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: false
})
export class UsuariosPage implements OnInit {
  usuarios: Usuario[] = [];

  constructor(
    private navCtrl: NavController,
    private ionicService: IonicService,
    private alertController: AlertController,
    private soporteService: SoporteService 
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    try {
      this.usuarios = await this.soporteService.obtenerUsuarios(); 
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      this.ionicService.mostrarToastAbajo('Error al cargar usuarios');
    }
  }

async bloquearUsuario(usuario: Usuario) {
  try {
    const alert = await this.alertController.create({
      header: 'Motivo del bloqueo',
      inputs: [
        {
          name: 'motivo',
          type: 'radio',
          label: 'Comportamiento inadecuado',
          value: 'Comportamiento inadecuado',
          checked: true
        },
        {
          name: 'motivo',
          type: 'radio',
          label: 'Incumplimiento de normas',
          value: 'Incumplimiento de normas'
        },
        {
          name: 'motivo',
          type: 'radio',
          label: 'Uso fraudulento',
          value: 'Uso fraudulento'
        },
        {
          name: 'motivo',
          type: 'radio',
          label: 'Otro',
          value: 'Otro'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Bloquear',
          handler: async (motivoSeleccionado) => {
            const confirmado = await this.mostrarAlerta(
              '¿Bloquear usuario?',
              `¿Estás seguro de que deseas bloquear a ${usuario.nombre}?\nMotivo: ${motivoSeleccionado}`
            );
            if (!confirmado) return;

            await this.soporteService.actualizarUsuario(usuario.id, {
              estaBloqueado: true,
              motivoBloqueo: motivoSeleccionado
            });

            this.usuarios = this.usuarios.map(u =>
              u.id === usuario.id ? { ...u, estaBloqueado: true } : u
            );

            this.ionicService.mostrarToastAbajo('Usuario bloqueado');
          }
        }
      ]
    });

    await alert.present();
  } catch (error) {
    console.error('Error al bloquear usuario:', error);
    this.ionicService.mostrarToastAbajo('No se pudo bloquear el usuario');
  }
}

  volverAtras() {
    this.navCtrl.back();
  }

  async mostrarAlerta(titulo: string, mensaje: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: titulo,
        message: mensaje,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Aceptar',
            handler: () => resolve(true)
          }
        ]
      });

      await alert.present();
    });
  }

  async desbloquearUsuario(usuario: Usuario) {
    const confirmado = await this.mostrarAlerta(
      '¿Desbloquear usuario?',
      `¿Estás seguro de que deseas desbloquear a ${usuario.nombre}?`
    );

    if (!confirmado) return;

    try {
      await this.soporteService.actualizarUsuario(usuario.id, {
        estaBloqueado: false,
        motivoBloqueo: ''
      });

      this.usuarios = this.usuarios.map(u =>
        u.id === usuario.id ? { ...u, estaBloqueado: false, motivoBloqueo: '' } : u
      );

      this.ionicService.mostrarToastAbajo('Usuario desbloqueado');
    } catch (error) {
      console.error('Error al desbloquear usuario:', error);
      this.ionicService.mostrarToastAbajo('No se pudo desbloquear el usuario');
    }
  }



}
