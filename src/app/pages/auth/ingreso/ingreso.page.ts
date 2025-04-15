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

  redireccionRegistro() {
    console.log('Redirigir a la página de registro');
    this.router.navigate(['/registro']);
  }
}
