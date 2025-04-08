import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.page.html',
  styleUrls: ['./ingreso.page.scss'],
})
export class IngresoPage {
  email: string = '';
  password: string = '';

  constructor(private navCtrl: NavController) {}

  // Lógica para manejar el inicio de sesión
  onLogin() {
    if (this.email && this.password) {
      // Aquí agregarías la lógica para autenticar al usuario
      console.log('Inicio de sesión exitoso con', this.email, this.password);
      // Redirigir a una página después de iniciar sesión, por ejemplo:
      // this.navCtrl.navigateForward('/home');
    } else {
      // Mensaje de error si falta alguno de los campos
      console.log('Por favor, completa todos los campos');
    }
  }

  // Lógica para manejar el enlace de 'Olvidaste tu contraseña?'
  onForgotPassword() {
    // Redirigir a la página de recuperación de contraseña
    console.log('Redirigiendo a la página de recuperación de contraseña');
    // this.navCtrl.navigateForward('/forgot-password');
  }

  // Lógica para manejar el enlace de '¿No tienes una cuenta? Regístrate'
  onRegister() {
    // Redirigir a la página de registro
    console.log('Redirigiendo a la página de registro');
    // this.navCtrl.navigateForward('/register');
  }
}
