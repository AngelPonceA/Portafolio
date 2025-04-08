import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { IonicModule } from '@ionic/angular'; // Importa IonicModule
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.page.html',
  styleUrls: ['./ingreso.page.scss'],
  standalone: true, // Aseguramos que el componente es standalone
  imports: [CommonModule, IonicModule, FormsModule], // Importa los módulos necesarios
})
export class IngresoPage {
  email: string = '';
  password: string = '';

  onForgotPassword() {
    console.log('Recuperar contraseña');
  }

  onLogin() {
    console.log('Iniciar sesión con', this.email, this.password);
  }

  onRegister() {
    console.log('Redirigir a la página de registro');
  }
}
