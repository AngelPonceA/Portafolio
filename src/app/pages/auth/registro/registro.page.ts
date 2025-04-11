import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false
})
export class RegistroPage implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('RegistroPage cargado');
  }

  onRegister() {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      console.log("Todos los campos son obligatorios");
      return;
    }

    if (this.password !== this.confirmPassword) {
      console.log("Las contraseñas no coinciden");
      return;
    }

    console.log('Registrando usuario:', this.username, this.email);
    this.router.navigate(['/ingreso']);
  }
}
