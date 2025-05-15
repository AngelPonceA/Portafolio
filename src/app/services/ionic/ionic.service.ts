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

  

}
