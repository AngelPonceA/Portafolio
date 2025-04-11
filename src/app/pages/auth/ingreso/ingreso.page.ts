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
  }

  onRegister() {
    console.log('Redirigir a la página de registro');
    this.router.navigate(['/registro']);
  }
}
