import { inject, Injectable } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs, addDoc, doc, setDoc, getDoc, onSnapshot, updateDoc, orderBy } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Usuario } from '../../models/usuario.models';
import { FirebaseError } from 'firebase/app';
import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { sendPasswordResetEmail } from '@angular/fire/auth';
import { IonicService } from "src/app/services/ionic/ionic.service";
import { CrudService } from '../crud/crud.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioStorage = "usuario";

  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);

  constructor(private nativeStorage: NativeStorage, private router: Router, private ionicService: IonicService,
    private crudService: CrudService, ) { }

  async comprobarSesion() {
    try {
      const sesion = await this.nativeStorage.getItem(this.usuarioStorage);
      console.log('Sesión existente:', sesion);
    } catch {
      const sesion = { id: 0, rol: 'invitado' };
      await this.nativeStorage.setItem(this.usuarioStorage, sesion);
      console.log('Sesión invitado creada:', sesion);
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
      // const { id: uid } = await this.nativeStorage.getItem(this.usuarioStorage);
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
      const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
      const snap = await getDoc(usuarioRef);

      if (snap.exists()) {
        const { nombre, email, rol } = snap.data() as { nombre: string; email: string; rol: string };
        return { nombre, email, rol };
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
  
  obtenerNotificacionesNav(): Observable<number> {
    return new Observable<number>((observer) => {
      // this.nativeStorage.getItem(this.usuarioStorage).then(({ id: uid }) => {
        const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
        const q = query(
          collection(this.firestore, 'alertas'),
          where('usuario_id', '==', uid),
          where('estado', '==', 'no vista')
        );

        return onSnapshot(q, (snap) => observer.next(snap.size), (error) => observer.error(error));
      // }).catch((error) => observer.error(error));
    });
  }

  async obtenerNotificaciones() {
    try {
      // const { id: uid } = await this.nativeStorage.getItem(this.usuarioStorage);
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
      const alertasRef = collection(this.firestore, 'alertas');
      const q = query(
        alertasRef,
        where('usuario_id', '==', uid),
        orderBy('fecha_creacion', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const notificaciones: any[] = [];
      querySnapshot.forEach((doc) => {
        notificaciones.push({ id: doc.id, ...doc.data() });
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
      // const { id: uid } = await this.nativeStorage.getItem(this.usuarioStorage);
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
      const usuarioRef = doc(this.firestore, `usuarios/${uid}`);
      await updateDoc(usuarioRef, { nombre: nuevoNombre });
    } catch (error) {
      console.error('Error al actualizar el nombre de usuario:', error);
      throw error;
    }
  }

  async login(email: string, clave: string) {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, clave);
      const uid = cred.user.uid;

      const docRef = doc(this.firestore, 'usuarios', uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        throw new Error('No se encontraron datos del usuario en Firestore.');
      }

      console.log('Credenciales ingresadas:', uid);
      const { rol } = snap.data()!;
      // await this.nativeStorage.setItem(this.usuarioStorage, { id: uid, rol: rol });
      // this.router.navigate(['/home']);
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email' || error.code === 'auth/invalid-credential') {
          console.error('Credenciales no validas.');
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
        telefono: number,
        recomendacion: [],
      };

      await setDoc(doc(this.firestore, 'usuarios', uid), nuevoUsuario);
      // await this.nativeStorage.setItem(this.usuarioStorage, { id: uid, rol: nuevoUsuario.rol });
      this.router.navigate(['/home']);
      console.log('Usuario registrado y guardado en Firestore:', nuevoUsuario);
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
          console.error('La contraseña actual es incorrecta.');
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
      // const { id: uid } = await this.nativeStorage.getItem(this.usuarioStorage);
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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
      this.comprobarSesion();
      console.log('Sesión de usuario eliminada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }
  
}
