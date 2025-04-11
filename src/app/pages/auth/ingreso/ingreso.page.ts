import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.page.html',
  styleUrls: ['./ingreso.page.scss'],
  standalone: false 
})
export class IngresoPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('IngresoPage cargado');
  }

  onForgotPassword() {
    console.log('Recuperar contraseña');
  }

  onLogin() {
    console.log('Iniciar sesión con', this.email, this.password);

    // comprobacion si usuario existe
    const userExists = this.checkUserExists(this.email); // Simulacion, se necesita backend

    if (!userExists) {
      console.log('El usuario no tiene cuenta. Redirigiendo a la página de registro...');
      this.router.navigate(['/registro']); // 
      return;
    }

    console.log('Usuario encontrado. Procediendo con el inicio de sesión...');
    
  }

  onRegister() {
    console.log('Redirigiendo a la página de registro');
    this.router.navigate(['/registro']); 
  }

  private checkUserExists(email: string): boolean {
    // aqui se simula la verificacion de usuario
    const dummyUsers = ['test@example.com', 'user@example.com']; // Usuarios de prueba
    return dummyUsers.includes(email);
  }
}

