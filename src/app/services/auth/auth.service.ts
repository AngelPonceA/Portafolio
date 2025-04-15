import { Injectable } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Router } from '@angular/router'; // Importa el Router

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuario = "usuario";

  constructor(private nativeStorage: NativeStorage, private router: Router) { }

  async comprobarSesion() {
    try {
      const sesion = await this.nativeStorage.getItem(this.usuario);
      console.log('Sesión existente:', sesion);
      // Ya hay sesión, no hacer nada
    } catch {
      const sesion = { id: 0, estado: 1 };
      await this.nativeStorage.setItem(this.usuario, sesion);
      console.log('Sesión invitado creada:', sesion);
    }
    this.router.navigate(['/home']);
  }

  async obtenerSesion() {
    try {
      const sesion = await this.nativeStorage.getItem(this.usuario);
      console.log('Sesión existente:', sesion);
      return sesion;
    } catch (error) {
      console.error('Error al obtener la sesión:', error);
      return null;
    }
  }

  async register(usuarioCorreo: string, usuarioContrasena: string, usuarioNombre: string) {
    const sesion = { id: 1, estado: 1 };
    await this.nativeStorage.setItem(this.usuario, sesion);
    console.log('Sesión de usuario guardada:', sesion);
  }

  async login(usuarioCorreo: string, usuarioContrasena: string) {
    if (usuarioCorreo == "admin" && usuarioContrasena == "admin") {
      const sesion = { id: 1, estado: 1 };
      await this.nativeStorage.setItem(this.usuario, sesion);
      console.log('Sesión de usuario guardada:', sesion);
      this.router.navigate(['/home']); 
    }
  }

  async logout() {
    await this.nativeStorage.remove(this.usuario);
    this.comprobarSesion();
    console.log('Sesión de usuario eliminada');}

}
