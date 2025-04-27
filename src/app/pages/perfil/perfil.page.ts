import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false,

})
export class PerfilPage implements OnInit {

  estado: number = 0;

  usuario: any = {
    rol: 'invitado',
    nombre: 'Juan Pérez',
    correo: 'juanitooficial@gmail.com',
  }

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit( ) {
  }

  establecerVista() {
    this.authService.obtenerSesion().then(sesion => {
      if (sesion) {
        this.estado = sesion.estado;
      }
    });
  }

  cambiarEstado(){
    this.usuario.rol = 'usuario';
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }
  
  irAIngreso() {
    this.router.navigate(['/ingreso']);
  }

  cerrarSesion() {
    this.authService.logout();
  };
  
    

}
