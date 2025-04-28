import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuario-vendedor',
  templateUrl: './usuario-vendedor.page.html',
  styleUrls: ['./usuario-vendedor.page.scss'],
  standalone: false
})
export class UsuarioVendedorPage implements OnInit {

  vendedor = {
    nombre: 'Tienda Express',
    correo: 'express.team@gmail.com'
  };

  constructor(private router: Router) { }

  cerrarSesion() {
    console.log('Cerrando sesión...');
    this.router.navigate(['/home']);
  }

  ngOnInit() {
  }

}
