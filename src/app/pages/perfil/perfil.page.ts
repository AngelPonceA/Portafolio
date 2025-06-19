import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth/auth.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { WebpayService } from 'src/app/services/webpay/webpay.service';
import { ActivatedRoute } from '@angular/router';

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
  constructor(private router: Router, private authService: AuthService, private ionicService: IonicService, private webpayService: WebpayService, private route: ActivatedRoute) { }

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token_ws');
    if (token) {
      this.confirmarTransaccion(token);
    }

    this.authService.obtenerPerfil().then((usuario) => {
      this.usuario = usuario;
    });
  }

  //Animación del botón de Webpay al hacer touch (mobile)
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
      this.mostrarBotonWebpay = false;
    },
    error: (err) => {
      this.ionicService.ocultarCargando();
      this.ionicService.mostrarAlerta('Error al confirmar', 'La transacción no se pudo validar.');
      console.error('Error al confirmar transacción:', err);
    }
  });
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
}
