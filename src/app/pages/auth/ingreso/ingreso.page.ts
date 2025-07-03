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

  emailTouched: boolean = false;
  passwordTouched: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {}

  iniciarSesion(email: string, password: string) {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (this.email.trim() && this.password.trim()) {
      this.authService.login(email, password);
    }
  }
}
