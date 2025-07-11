import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth/auth.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { WebpayService } from 'src/app/services/webpay/webpay.service';
import { ActivatedRoute } from '@angular/router';
import { ModalTarjetaDepositosService } from 'src/app/services/modal-tarjeta-depositos/modal-tarjeta-depositos.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import imageCompression from 'browser-image-compression';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ModalNumeroComponent } from 'src/app/components/modal-numero/modal-numero.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,

})
export class PerfilPage implements OnInit {

  usuario?: any;
  costoMembresia: number = 50000;
  mostrarBotonWebpay: boolean = false;
  imagen_default: string = 'assets/img/profile-placeholder.jpg';

  constructor(private router: Router, 
              private authService: AuthService, 
              private ionicService: IonicService, 
              private webpayService: WebpayService, 
              private route: ActivatedRoute, 
              private modalTarjetaDepositos: ModalTarjetaDepositosService,
              private actionSheetCtrl: ActionSheetController,
              private modalCtrl: ModalController,
              private location: Location,
  ) { }

  async ngOnInit() {
    // Esto es clave, es la comprobación de pago para WebPay
    this.route.queryParams.subscribe(params => {
      const token = params['token_ws'];
      if (token) {
        this.confirmarTransaccion(token);
      }
    });

    this.authService.obtenerPerfil().then((usuario) => {
      this.usuario = usuario;
    });
  }

  ngAfterViewInit() {
    const boton = document.querySelector('.webpay-button');
    if (boton) {
      boton.addEventListener('touchstart', () => {
        boton.classList.add('animar-overlay');
        setTimeout(() => boton.classList.remove('animar-overlay'), 500);
      });
    }
  }

  estadoBotonWebpay() {
    this.mostrarBotonWebpay = true;
  }

  AlertaMembresia(){
    this.ionicService.mostrarAlerta(
      '¡Atención!',
      'Para ver las predicciones de venta debes pagar una membresía de $50.000 CLP, válida por un año.'
    );
  }

  iniciarPagoWebpay() {
    const data = {
      amount: this.costoMembresia,
      session_id: 'sesion-' + Date.now(),
      buy_order: 'orden-' + Date.now(),
    };

    this.webpayService.crearTransaccion(data).subscribe((res: any) => {
      if (res.url && res.token) {
        window.open(`${res.url}?token_ws=${res.token}`, '_system');
      } else {
        this.ionicService.mostrarAlerta('Error', 'No se pudo iniciar el pago.');
      }
    });
  };

  redirigirAWebpay(url: string, token: string) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'token_ws';
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }

  confirmarTransaccion(token: string) {
    this.ionicService.mostrarCargando('Confirmando membresía...');

    this.webpayService.confirmarTransaccion(token).subscribe({next: async (respuesta: any) => {

      if (respuesta && respuesta.status == 'FAILED') {
        await this.ionicService.mostrarAlertaPromesa(
          'Pago rechazado',
          'La transacción fue rechazada por Webpay.'
        );
        return;
      } else if (respuesta && respuesta.status == 'CANCELLED') {
          await this.ionicService.mostrarAlertaPromesa(
            'Pago cancelado',
            'La transacción ha sido cancelada.'
          );
          return;
        } else if (respuesta && respuesta.status == 'EXPIRED') {
            await this.ionicService.mostrarAlertaPromesa(
              'Pago expirado',
              'La sesión de pago expiró antes de completarse.'
            );
            return;
          }

        await this.authService.actualizarMembresia(true);
        this.ionicService.ocultarCargando();
        this.usuario.membresia = true;
        this.mostrarBotonWebpay = false;
        this.ionicService.mostrarAlerta('¡Membresía activa!', 'Ya puedes ver tus predicciones de venta 🧠');
        this.location.replaceState('/perfil');
      },
      error: (err) => {
        this.ionicService.ocultarCargando();
        this.ionicService.mostrarAlerta('Error al confirmar', 'La transacción no se pudo validar.');
       this.ionicService.mostrarAlerta('Error al confirmar transacción:', err);
      }
    });
  }

  //Modal de Tarjeta de Depósitos
  async convertirEnVendedor() {
    try {
      const datosBancarios = await this.modalTarjetaDepositos.mostrarModal();
      await this.modalTarjetaDepositos.guardarDatosBancarios( datosBancarios );
      await this.authService.actualizarRol('usuario-vendedor');

      this.usuario.rol = 'usuario-vendedor';
      this.ionicService.mostrarAlerta('¡Éxito!', 'Ya eres vendedor en la plataforma.');
    } catch {
      this.ionicService.mostrarAlerta('Cancelado', 'No se realizó ningún cambio.');
    }
  }

  async cambiarTarjeta() {
  try {
    const datosActuales = await this.modalTarjetaDepositos.obtenerDatosBancarios();
    const nuevosDatos = await this.modalTarjetaDepositos.mostrarModalConDatos(datosActuales); // pasa prellenado
    await this.modalTarjetaDepositos.guardarDatosBancarios( nuevosDatos );
    this.ionicService.mostrarAlerta('Actualizado', 'Tu tarjeta fue actualizada.');
  } catch {
    this.ionicService.mostrarAlerta('Cancelado', 'No se modificó la tarjeta.');
  }
}

// Modal para cambiar el número de teléfono
  async cambiarNumeroTelefono() {
    const modal = await this.modalCtrl.create({
      component: ModalNumeroComponent,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      try {
        await this.authService.actualizarNumeroTelefono(data);
        this.usuario.telefono = data;
        this.ionicService.mostrarToastArriba('Teléfono actualizado con éxito');
      } catch (error) {
        this.ionicService.mostrarAlerta('Error', 'No se pudo actualizar el número.');
      }
    } else {
      this.ionicService.mostrarToastArriba('No se modificó el número');
    }
  }


// ====== Metodos de cámara y archivos para foto de perfil ======

  async subirFotoPerfilPrompt() {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Selecciona origen de la foto',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera-outline',
          handler: () => this.tomarFoto()
        },
        {
          text: 'Galería',
          icon: 'images-outline',
          handler: () => this.elegirDeGaleria()
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await sheet.present();
  }

// Abre la cámara directamente
async tomarFoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera    
    });
    if (image.dataUrl) {
      await this.procesarImagen(image.dataUrl);
    } else {
      this.ionicService.mostrarAlerta('Error', 'No se pudo obtener la foto.');
    }
  } catch {
    this.ionicService.mostrarAlerta('Error', 'No se pudo tomar la foto.');
  }
}

// Abre la galería fija
async elegirDeGaleria() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos     
    });
    if (image.dataUrl) {
      await this.procesarImagen(image.dataUrl);
    } else {
      this.ionicService.mostrarAlerta('Error', 'No se pudo obtener la foto.');
    }
  } catch {
    this.ionicService.mostrarAlerta('Error', 'No se pudo elegir la foto.');
  }
}

private async procesarImagen(dataUrl: string) {
  const file = this.dataURLtoFile(dataUrl, 'profile.jpg');
  const compressed = await this.compressImage(file);
  const uid = await this.authService.getUserId();
  if (uid && compressed) {
    await this.authService.cargarFotoPerfilVendedorComoBase64(uid, compressed);
    this.usuario!.imagen = URL.createObjectURL(compressed);
    this.ionicService.mostrarToastArriba('Foto actualizada con éxito');
  }
}

async compressImage(file: File): Promise<File | null> {
  const options = {
    maxSizeMB: 0.1,         
    maxWidthOrHeight: 1024,    
    useWebWorker: true,         
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error al comprimir imagen:', error);
    this.ionicService.mostrarAlerta('Error al comprimir la imagen', 'danger');
    return null;
  }
}

  dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  }


  irARegistro() {
    this.router.navigate(['/registro']);
  }
  
  irAIngreso() {
    this.router.navigate(['/ingreso']);
  }

  cerrarSesion() {
    this.authService.logout();
  };


  onImageError(event: Event) {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'assets/img/profile-placeholder.jpg';
  imgElement.onerror = null;
}

}
