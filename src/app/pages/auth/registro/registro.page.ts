import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
  }

  registrar() {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      console.log("Todos los campos son obligatorios");
    }

    if (this.password !== this.confirmPassword) {
      console.log("Las contraseñas no coinciden");
    }
    this.authService.registrar(this.username, this.email, this.password)
  }

}
