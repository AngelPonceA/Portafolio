import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IonicService {

  constructor(private toast: ToastController, private alerta: AlertController) { }

  async mostrarToastAbajo(mensaje: string) {
    const toast = await this.toast.create({
      message: mensaje,
      duration: 5000,
      position: 'bottom',
    });
    await toast.present();
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alerta.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar'],
    });
    await alert.present();
  }

  async mostrarAlertaConfirmacion(titulo: string, mensaje: string, onConfirm: () => void) {
    const alert = await this.alerta.create({
      header: titulo,
      message: mensaje,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí',
          handler: onConfirm
        }
      ]
    });

    await alert.present();
  }

}
