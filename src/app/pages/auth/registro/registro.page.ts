import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { IonicModule } from '@ionic/angular'; // Importa IonicModule
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel
import { Router } from '@angular/router';  // Importa Router

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true, // Aseguramos que el componente es standalone
  imports: [CommonModule, IonicModule, FormsModule], // Importa los módulos necesarios
})
export class RegistroPage {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}  // Inyecta el Router

  // Método para manejar el registro
  onRegister() {
    // Validación de campos vacíos
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      console.log("Todos los campos son obligatorios");
      return;
    }

    // Validación de contraseñas
    if (this.password !== this.confirmPassword) {
      console.log("Las contraseñas no coinciden");
      return;
    }

    // Si pasa todas las validaciones
    console.log('Registrando usuario:', this.username, this.email);

    // Después de un registro exitoso, redirigir al login
    this.router.navigate(['/login']);
  }
}
