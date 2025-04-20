import { inject, Injectable } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Router } from '@angular/router'; // Importa el Router
import { Firestore, collection, query, where, getDocs, addDoc, doc, setDoc,  } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuario = "usuario";

  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);

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


    async registrarUsuario(correo: string, contrasena: string, nombre: string) {
      try {
        // Crear el usuario en Firebase Authentication
        const credenciales = await createUserWithEmailAndPassword(this.auth, correo, contrasena);
    
        const uid = credenciales.user.uid;
    
        // Guardar información extra en Firestore
        const usuariosRef = collection(this.firestore, 'usuarios');
        await addDoc(usuariosRef, {
          uid: uid,
          correo: correo,
          nombre: nombre,
          estado: 1,
          rol: 'usuario',
          creadoEn: new Date()
        });
        const sesion = { id: 1, estado: 1 };
        await this.nativeStorage.setItem(this.usuario, sesion);
        console.log('Sesión de usuario guardada:', sesion);
        console.log('Usuario registrado correctamente');
      } catch (error) {
        console.error('Error al registrar usuario:', error);
      }
    }
  

  async registrar(correo: string, clave: string, nombre: string): Promise<void> {
    try {
      const usuariosRef = collection(this.firestore, 'usuario'); // Cambia 'usuarios' por el nombre de tu colección
      const nuevoUsuario = {
        correo: correo,
        clave: clave, // Nota: No es seguro guardar claves en texto plano. Usa un sistema de hash.
        nombre: nombre,
        fechaRegistro: new Date()
      };
  
      const docRef = await addDoc(usuariosRef, nuevoUsuario); // Firebase genera automáticamente un ID único
      console.log('Usuario registrado con ID:', docRef.id);
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
    }
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
    console.log('Sesión de usuario eliminada');
  }

    
    async verificarUsuarioExiste(correo: string): Promise<boolean> {
      try {
        const usuariosRef = collection(this.firestore, 'usuario'); // Cambia 'usuarios' por el nombre de tu colección
        const q = query(usuariosRef, where('email', '==', correo)); // Consulta por el campo 'correo'
        const querySnapshot = await getDocs(q);
    
        if (!querySnapshot.empty) {
          console.log('Usuario encontrado:', querySnapshot.docs[0].data());
          return true; // El usuario existe
        } else {
          console.log('Usuario no encontrado');
          return false; // El usuario no existe
        }
      } catch (error) {
        console.error('Error al verificar si el usuario existe:', error);
        return false; // Manejo de errores
      }
    }

}
