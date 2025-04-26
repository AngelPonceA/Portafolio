import { inject, Injectable } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Router } from '@angular/router'; // Importa el Router
import { Firestore, collection, query, where, getDocs, addDoc, doc, setDoc, getDoc, onSnapshot,  } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword, signInWithEmailAndPassword  } from '@angular/fire/auth';
import { Usuario } from '../../models/usuario.models'; // Asegúrate de que la ruta sea correcta
import { FirebaseError } from 'firebase/app';
import { catchError, from, Observable, of, switchMap } from 'rxjs';
import { sendPasswordResetEmail } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuario = "usuario";

  firestore: Firestore = inject(Firestore);
  auth: Auth = inject(Auth);

  constructor( private nativeStorage: NativeStorage, private router: Router ) { }

  async comprobarSesion() {
    try {
      const sesion = await this.nativeStorage.getItem(this.usuario);
      console.log('Sesión existente:', sesion);
    } catch {
      const sesion = { id: 0, estado: 1 };
      await this.nativeStorage.setItem(this.usuario, sesion);
      console.log('Sesión invitado creada:', sesion);
    }
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

    async obtenerNumeroVendedor(uid: string) {
      const ref = doc(this.firestore, `usuarios/${uid}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        let data = snap.data();
        return data['telefono'].replace(/[^\d]/g, '');
      }
      return undefined;
    }

  obtenerNotificacionesNoVistas() {
    return from(this.nativeStorage.getItem('id')).pipe(
      switchMap(uid => {
        if (!uid || uid === 0) return of(0);
  
        const q = query(
          collection(this.firestore, 'alertas'),
          where('usuario_id', '==', uid),
          where('leido', '==', false)
        );
  
        return new Observable<number>(observer => {
          const unsubscribe = onSnapshot(q, snap => observer.next(snap.size));
          return () => unsubscribe();
        });
      }),
      catchError(() => of(0))
    );
  }
  
  async login(email: string, clave: string) {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, clave);
      const uid = cred.user.uid;
  
      const docRef = doc(this.firestore, 'usuarios', uid);
      const snap = await getDoc(docRef);
      
      if (!snap.exists()) {
        console.log('No se encontraron las credenciales:', uid);
      }
      
      console.log('Credenciales ingresadas:', uid);
      const { rol } = snap.data()!;
      await this.nativeStorage.setItem(this.usuario, { id: uid, estado: 1, rol });
      this.router.navigate(['/home']);

    } catch (error) {
      console.error('Error en login:', error);
    }
  }

  async registrar(nombre: string, email: string, clave: string) {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, clave);
      const uid = cred.user.uid;
  
      const nuevoUsuario: Usuario = {
        id: uid,
        nombre: nombre,
        email: email,
        rol: 'usuario'
      };

      await setDoc(doc(this.firestore, 'usuarios', uid), nuevoUsuario);
      await this.nativeStorage.setItem(this.usuario, { id: uid, estado: 1 });
      this.router.navigate(['/home']);
      console.log('Usuario registrado y guardado en Firestore:', nuevoUsuario);
      
    } catch (error) {
      let err = error as FirebaseError;
      if (err.code === 'auth/email-already-in-use') {
        console.error('El correo ya está registrado.');
      } else {
        console.error('Error en el registro:', err.message);
      }
    }
  }

  recuperarClave(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  async logout() {
    await this.nativeStorage.remove(this.usuario);
    this.comprobarSesion();
    console.log('Sesión de usuario eliminada');
  }

}
