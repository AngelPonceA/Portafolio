import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.page.html',
  styleUrls: ['./ingreso.page.scss'],
  standalone: false 
})
export class IngresoPage implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    console.log('IngresoPage cargado');
  }

  onForgotPassword() {
    console.log('Recuperar contraseña');
  }

  iniciarSesion(email:string, password:string) {
    this.authService.login(email, password);
  }

  onRegister() {
    console.log('Redirigir a la página de registro');
    this.router.navigate(['/registro']);
  }

  private checkUserExists(email: string): boolean {
    // aqui se simula la verificacion de usuario
    const dummyUsers = ['test@example.com', 'user@example.com']; // Usuarios de prueba
    return dummyUsers.includes(email);
  }
}

