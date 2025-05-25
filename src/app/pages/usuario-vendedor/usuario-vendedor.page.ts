import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';

declare const paypal: any; 

@Component({
  selector: 'app-usuario-vendedor',
  templateUrl: './usuario-vendedor.page.html',
  styleUrls: ['./usuario-vendedor.page.scss'],
  standalone: false
})
export class UsuarioVendedorPage implements OnInit {

  vendedor = {
    nombre: 'Tienda Express',
    correo: 'express.team@gmail.com'
  };

  usuario?: any;
  mostrarBotonPaypal: boolean = false;
  costoMembresia: number = 50000;
  
  constructor(private router: Router, private authService: AuthService, private ionicService: IonicService) { }

  
  ngOnInit() {
    this.authService.obtenerPerfil().then((usuario) => {
      this.usuario = usuario;
    })
  }
  
  cerrarSesion() {
    console.log('Cerrando sesión...');
    this.router.navigate(['/home']);
  }

  estadoBotonPaypal() {
    if (!this.mostrarBotonPaypal) {
      this.mostrarBotonPaypal = true;
      this.ionicService.mostrarAlerta('¡Atención!', 'Para poder ver las predicciones de venta debes pagar una membresía de $50.00 USD, esta dura un año!')
      setTimeout(() => {
      this.iniciarBotonPaypal();}, 0);    
    } else {
      this.mostrarBotonPaypal = false;
    }
  }

  iniciarBotonPaypal() {

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            { amount: {
                value: (this.costoMembresia / 1000).toFixed(2),
                currency_code: 'USD',
              },
            },
          ],
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          this.authService.actualizarMembresia(true);
          this.mostrarBotonPaypal = false;
          this.ionicService.mostrarAlerta('Pago exitoso:', details)
          console.log('Pago exitoso:', details);
        });
      },
      onError: (err: any) => {
        console.log('Error durante el pago:', err);
        this.ionicService.mostrarAlerta('Error durante el pago', err)

      },
    }).render('#paypal-button-container');

  }

}
