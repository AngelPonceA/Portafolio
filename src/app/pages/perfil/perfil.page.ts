import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth/auth.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { WebpayService } from 'src/app/services/webpay/webpay.service';
import { ActivatedRoute } from '@angular/router';
import { ModalTarjetaDepositosService } from 'src/app/services/modal-tarjeta-depositos/modal-tarjeta-depositos.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  constructor(
              private router: Router, 
              private authService: AuthService, 
              private ionicService: IonicService, 
              private webpayService: WebpayService, 
              private route: ActivatedRoute, 
              private modalTarjetaDepositos: ModalTarjetaDepositosService
            ) { }

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token_ws');
    if (token) {
      this.confirmarTransaccion(token);
    }

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
      session_id: 'membresia-' + Date.now(),
      buy_order: 'id-subs-' + Date.now()
    };

    this.ionicService.mostrarCargando('Redirigiendo a WebPay...');

    this.webpayService.crearTransaccion(data).subscribe({
      next: (res: any) => {
        if (res.url && res.token) {
          this.redirigirAWebpay(res.url, res.token);
        } else {
          this.ionicService.mostrarAlerta('Error', 'No se pudo iniciar la transacción.');
        }
      },
      error: (err) => {
        this.ionicService.mostrarAlerta('Error', 'No se pudo iniciar la transacción.');
        console.error(err);
      }
    });
  }

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

    this.webpayService.confirmarTransaccion(token).subscribe({
      next: async (respuesta: any) => {
        await this.authService.actualizarMembresia(true);
        this.ionicService.ocultarCargando();
        this.ionicService.mostrarAlerta('¡Membresía activa!', 'Ya puedes ver tus predicciones de venta 🧠');
        this.usuario.membresia = true;
        this.mostrarBotonWebpay = false;
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

  // Subir foto de perfil
  async subirFotoPerfil(event: any) {
    const archivo = event.target.files[0];
    if (!archivo || !this.usuario?.id) return;

    try {
      await this.authService.cargarFotoPerfilVendedorComoBase64(this.usuario.id, archivo);
      this.usuario.imagen = URL.createObjectURL(archivo); // Vista previa instantánea
      this.ionicService.mostrarToastArriba('Foto actualizada con éxito');
    } catch (error) {
      this.ionicService.mostrarAlerta('Error', 'No se pudo subir la imagen.');
    }
  }

  async elegirFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      const uid = await this.authService.getUserId();
      if (uid && image.dataUrl) {
        const file = this.dataURLtoFile(image.dataUrl, 'profile.jpg');
        await this.authService.cargarFotoPerfilVendedorComoBase64(uid, file);
        this.usuario.imagen = image.dataUrl;
        this.ionicService.mostrarToastArriba('Foto actualizada con éxito');
      }
    } catch (error) {
      this.ionicService.mostrarAlerta('Error', 'No se pudo subir la imagen.');
    }
  }
  // Utilidad para convertir dataURL a File
  dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
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
