import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class IonicService {

  private loading: HTMLIonLoadingElement | null = null;

  constructor(private toast: ToastController, 
              private alerta: AlertController,
              private loadingController: LoadingController) { }

  async mostrarToastAbajo(mensaje: string) {
    const toast = await this.toast.create({
      message: mensaje,
      duration: 5000,
      position: 'bottom',
    });
    await toast.present();
  }

  async mostrarToastArriba(mensaje: string) {
    const toast = await this.toast.create({
      message: mensaje,
      duration: 5000,
      position: 'top',
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

  async mostrarAlertaPromesa(titulo: string, mensaje: string): Promise<void> {
    return new Promise(async (resolve) => {
      const alert = await this.alerta.create({
        header: titulo,
        message: mensaje,
        buttons: [
          {
            text: 'Aceptar',
            handler: () => {
              resolve(); 
            }
          }
        ],
        backdropDismiss: false
      });
      await alert.present();
    });
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

  async confirmarAccion(titulo: string, mensaje: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alerta.create({
        header: titulo,
        message: mensaje,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: 'Confirmar',
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }


  async mostrarCargando(mensaje: string = 'Cargando...') {
    if (this.loading) return;

    this.loading = await this.loadingController.create({
      message: mensaje,
      spinner: 'crescent',
      cssClass: 'custom-loading',
      backdropDismiss: false,
    });

    await this.loading.present();
  }

  async ocultarCargando() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }


}
