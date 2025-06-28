import { inject, Injectable } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs, addDoc, doc, setDoc, getDoc, onSnapshot, updateDoc, orderBy } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Auth, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Usuario } from '../../models/usuario.models';
import { FirebaseError } from 'firebase/app';
import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { sendPasswordResetEmail } from '@angular/fire/auth';
import { IonicService } from "src/app/services/ionic/ionic.service";
import { CrudService } from '../crud/crud.service';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioStorage = "usuario";

  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);
  storage: Storage = inject(Storage);


  constructor(private nativeStorage: NativeStorage, private router: Router, private ionicService: IonicService,
    private crudService: CrudService, private ionicServe: IonicService, private navCtrl: NavController) { }

  async comprobarSesion() {
    try {
      const sesion = await this.nativeStorage.getItem(this.usuarioStorage);
      const uid = await this.obtenerSesion().then(sesion => sesion.id);
      const usuario = await this.obtenerPerfil();
      if (usuario && usuario.estaBloqueado) {
        const motivo = usuario.motivoBloqueo || 'No especificado';
        await this.ionicServe.mostrarAlertaPromesa('Alerta', 'Esta cuenta ha sido bloqueada por administración. Motivo: ' + motivo);
        await this.logout();
      }
    } catch {
      const sesion = { id: 0, rol: 'invitado' };
      await this.nativeStorage.setItem(this.usuarioStorage, sesion);
    }
  }

  async obtenerSesion() {
    try {
      const sesion = await this.nativeStorage.getItem(this.usuarioStorage);
      console.log('Sesión existente:', sesion);
      return sesion;
    } catch (error) {
      console.error('Error al obtener la sesión:', error);
      return null;
    }
  }

  async obtenerPerfil() {
    try {
      const sesion = await this.obtenerSesion();
      const uid = sesion?.id;      
      const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
      const snap = await getDoc(usuarioRef);

      if (snap.exists()) {
        const { nombre, email, rol, membresia, imagen, estaBloqueado, motivoBloqueo } = snap.data() as 
        { nombre: string; email: string;  rol: string; membresia: boolean; imagen: string; estaBloqueado: boolean; motivoBloqueo: string; };
        return { nombre, email, rol, membresia, imagen: imagen ? imagen : null, id: uid, 
          estaBloqueado: estaBloqueado ? estaBloqueado : false, motivoBloqueo: motivoBloqueo ? motivoBloqueo : '' };
      } else {
        console.error('Usuario no encontrado en Firestore.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      return null;
    }
  }

  async obtenerNumeroVendedor(uid: string) {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        let data = snap.data();
        return data['telefono'].replace(/[^\d]/g, '');
      } else {
        throw new Error('Usuario no encontrado en Firestore.');
      }
    } catch (error) {
      console.error('Error al obtener el número del vendedor:', error);
      throw error;
    }
  }

  async obtenerDetallesTienda(uid: string) {
    try {
      const ref = doc(this.firestore, `usuarios/${uid}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        let data = snap.data();
        return data;
      } else {
        throw new Error('Tienda no encontrada');
      }
    } catch (error) {
      console.error('Error al obtener la tienda:', error);
      throw error;
    }
  }
  
  obtenerNotificacionesNav(usuario_id: string): Observable<number> {
    return new Observable<number>((observer) => {
        const q = query(
          collection(this.firestore, 'alertas'),
          where('usuario_id', '==', usuario_id),
          where('estado', '==', 'no vista')
        );

        return onSnapshot(q, (snap) => observer.next(snap.size), (error) => observer.error(error));
    });
  }

  async obtenerNotificaciones() {
    try {
      const uid = await this.obtenerSesion().then(sesion => sesion.id);
      const alertasRef = collection(this.firestore, 'alertas');
      const q = query(
        alertasRef,
        where('usuario_id', '==', uid),
        orderBy('fecha_creacion', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const notificaciones: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data['estado'] === 'vista' || data['estado'] === 'no vista') {
          notificaciones.push({ id: doc.id, ...data });
        }
      });
      return notificaciones;

    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  }

  async actualizarEstadoNotificacion(id: string, nuevoEstado: string) {
    try {
      const notificacionRef = doc(this.firestore, `alertas/${id}`);
      await updateDoc(notificacionRef, { estado: nuevoEstado });
    } catch (error) {
      console.error('Error al actualizar el estado de la notificación:', error);
      throw error;
    }
  }

  async actualizarNombre(nuevoNombre: string) {
    try {
      const uid = await this.obtenerSesion().then(sesion => sesion.id);
      const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
      await updateDoc(usuarioRef, { nombre: nuevoNombre });
    } catch (error) {
      console.error('Error al actualizar el nombre de usuario:', error);
      throw error;
    }
  }

  async actualizarMembresia(nuevoEstado: boolean) {
    try {
      const uid = await this.obtenerSesion().then(sesion => sesion.id);
      const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
      const fechaActual = new Date();
      const nuevaMembresia = new Date(fechaActual);
      nuevaMembresia.setFullYear(nuevaMembresia.getFullYear() + 1);
      await updateDoc(usuarioRef, { membresia: nuevoEstado, miembroHasta: nuevaMembresia });
    } catch (error) {
      console.error('Error al actualizar el estado de membresia:', error);
      throw error;
    }
  }

  async login(email: string, clave: string) {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, clave);
      const uid = cred.user.uid;

      const docRef = doc(this.firestore, 'usuarios', uid);
      const snap = await getDoc(docRef);
      const usuario = await this.obtenerPerfil();


      if (!snap.exists()) {
        throw new Error('No se encontraron datos del usuario en Firestore.');
      }

      if (usuario && usuario.estaBloqueado) {
        const motivo = usuario.motivoBloqueo || 'No especificado';
        await this.ionicService.mostrarAlertaPromesa('Alerta', 'Esta cuenta ha sido bloqueada por administración. Motivo: ' + motivo);
        return;
      }

      const { rol } = snap.data()!;
      await this.nativeStorage.setItem(this.usuarioStorage, { id: uid, rol: rol });
      await this.redirigirAHomeLimpio();

    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email' || error.code === 'auth/invalid-credential') {
          this.ionicService.mostrarToastAbajo('Credenciales no validas.');
        } else {
          console.error('Error en login:', error.message);
        }
      } else {
        console.error('Error inesperado en login:', error);
      }
      throw error;
    }
  }

  async registrar(nombre: string, email: string, clave: string, number: string) {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, clave);
      const uid = cred.user.uid;

      const nuevoUsuario: Usuario = {
        id: uid,
        nombre: nombre,
        email: email,
        rol: 'usuario',
        telefono: `+569${number.replace(/\D/g, '')}`,
        membresia: false,
        miembroHasta: '',
        recomendacion: [],
      };

      await setDoc(doc(this.firestore, 'usuarios', uid), nuevoUsuario);
      await this.nativeStorage.setItem(this.usuarioStorage, { id: uid, rol: nuevoUsuario.rol });
      await this.redirigirAHomeLimpio();
      this.ionicServe.mostrarToastAbajo(`Sesión iniciada con: ${email}`);
      
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          console.error('Correo ya en uso.');
        } else {
          console.error('Error en el registro:', error.message);
        }
      } else {
        console.error('Error inesperado en el registro:', error);
      }
      throw error;
    }
  }

  async recuperarClave(email: string) {
    return await sendPasswordResetEmail(this.auth, email).catch(error => {
      console.error('Error al enviar el correo de recuperación:', error.message);
      throw error;
    });
  }

  async cambiarClave(claveActual: string, claveNueva: string) {
    try {
      const user = this.auth.currentUser;

      if (!user) {
        throw new Error('No hay un usuario autenticado.');
      }

      const credential = EmailAuthProvider.credential(user.email!, claveActual);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, claveNueva);

      return true;
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/wrong-password') {
          this.ionicService.mostrarToastAbajo('La contraseña actual es incorrecta.');
        } else {
          console.error('Error al cambiar la contraseña:', error.message);
        }
      } else {
        console.error('Error inesperado al cambiar la contraseña:', error);
      }
      throw error;
    }
  }

  async actualizarRecomendadosUsuario(productos: any[]) {
    try {
      const uid = await this.obtenerSesion().then(sesion => sesion.id);
      const userRef = doc(this.firestore, `usuarios/${uid}`);
      const userSnap = await this.crudService.obtenerDocumentoPorId('usuarios', uid);
      let etiquetasGuardadas: string[] = userSnap?.recomendacion || [];

      const nuevasEtiquetas: string[] = (Array.isArray(productos) ? productos : [productos])
        .flatMap(producto => Array.isArray(producto.etiquetas) ? producto.etiquetas : []);

      const todasLasEtiquetas = Array.from(new Set([...etiquetasGuardadas, ...nuevasEtiquetas]));

      await setDoc(userRef, { recomendacion: todasLasEtiquetas }, { merge: true });
      console.log('Etiquetas recomendadas actualizadas:', todasLasEtiquetas);
    } catch (error) {
      console.log('Error al actualizar etiquetas recomendadas:', error);
    }
  }

  async logout() {
    try {
      await this.nativeStorage.remove(this.usuarioStorage);
      await this.comprobarSesion();
      await this.redirigirAHomeLimpio();
      console.log('Sesión de usuario eliminada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }
  
  async redirigirAHomeLimpio() {
    await this.router.navigateByUrl('/', { skipLocationChange: true });
    await this.router.navigate(['/home'], { replaceUrl: true });
    window.location.href = '/home';
  }

  // Obtener el UID del usuario actual
  getUserId(): Promise<string> {
    return new Promise((resolve, reject) => {
      const user = this.auth.currentUser;
      if (user) {
        resolve(user.uid);
      } else {
        reject('No hay un usuario autenticado.');
      }
    });
  }

    // Actualizar el rol del usuario
  async actualizarRol(nuevoRol: string) {
      try {
        const uid = await this.getUserId();
        const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
        await updateDoc(usuarioRef, { rol: nuevoRol });
        console.log('Rol del usuario actualizado a:', nuevoRol);
      } catch (error) {
        console.error('Error al actualizar el rol del usuario:', error);
        throw error;
      }
  }

  async cargarFotoPerfilVendedorComoBase64(uid: string, file: File): Promise<void> {
    try {
      const base64String = await this.convertFileToBase64(file);

      // Actualizar documento del usuario en Firestore con base64
      const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
      await updateDoc(usuarioRef, { imagen: base64String });

      console.log('Imagen base64 actualizada en Firestore');
    } catch (error) {
      console.error('Error al subir imagen base64:', error);
      throw error;
    }
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = error => reject(error);
    });
  }

}
