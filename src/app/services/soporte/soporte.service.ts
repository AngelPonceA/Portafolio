import { Injectable, runInInjectionContext, EnvironmentInjector, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { solicitudSoporte } from 'src/app/models/soporte/soporte.models';
import { Usuario } from 'src/app/models/usuario.models';
import { reporte } from 'src/app/models/soporte/reporte.models';

@Injectable({
  providedIn: 'root'
})
export class SoporteService {

  constructor(
    private authService: AuthService,
    private firestore: Firestore
  ) {}

  // Enviar solicitud de soporte
  async enviarSolicitud(soporte: Omit<solicitudSoporte, 'usuarioId' | 'fechaCreacion'>): Promise<void> {
    const usuarioId = await this.authService.getUserId();
    const uid = doc(collection(this.firestore, 'solicitudes')).id;
    const nuevaSolicitud: solicitudSoporte = {
      ...soporte,
      usuarioId,
      fechaCreacion: new Date()
    };
    return setDoc(doc(this.firestore, 'solicitudes', uid), nuevaSolicitud);
  }

  // Obtener todas las solicitudes
  async obtenerSolicitudes(): Promise<solicitudSoporte[]> {
    const ref = collection(this.firestore, 'solicitudes');
    const q = query(ref, orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...(data as solicitudSoporte),
        id: doc.id,
        fechaCreacion: data['fechaCreacion']?.toDate ? data['fechaCreacion'].toDate() : data['fechaCreacion'],
      };
    });
  }

  // Obtener las solicitudes con estado == pendiente
  async obtenerSolicitudesPendientes(): Promise<solicitudSoporte[]>{
    const ref = collection(this.firestore, 'solicitudes');
    const q = query(ref, where('estado', '==' , 'pendiente'), orderBy('fechaCreacion', 'desc'))
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...(data as solicitudSoporte),
        id: doc.id,
        fechaCreacion: data['fechaCreacion']?.toDate ? data['fechaCreacion'].toDate() : data['fechaCreacion']
      }
    })
  };

  // Obtener solicitudes de un usuario
  async obtenerSolicitudesPorUsuario(usuarioId: string): Promise<solicitudSoporte[]> {
    const ref = collection(this.firestore, 'solicitudes');
    const q = query(ref, where('usuarioId', '==', usuarioId), orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
      ...(data as solicitudSoporte),
      id: doc.id,
      fechaCreacion: data['fechaCreacion']?.toDate ? data['fechaCreacion'].toDate() : data['fechaCreacion'],
      };
    });
  }

  // Actualizar estado o prioridad de solicitud
  actualizarSolicitud(id: string, data: Partial<solicitudSoporte>): Promise<void> {
    return updateDoc(doc(this.firestore, 'solicitudes', id), data);
  }

  // Obtener usuarios (excluyendo administradores)
  async obtenerUsuarios(): Promise<Usuario[]> {
    const ref = collection(this.firestore, 'usuarios');
    const snapshot = await getDocs(ref);
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Usuario))
      .filter(usuario => usuario.rol !== 'admin');
  }

  // Método para bloquear usuario
  actualizarUsuario(id: string, data: Partial<Usuario>): Promise<void> {
    return updateDoc(doc(this.firestore, 'usuarios', id), data);
  }

  // ================ Metodos de reporte ================ 
  // Enviar reporte de usuario
  async enviarReporte(reporteData: Omit<reporte, 'usuarioId' | 'fechaCreacion' | 'estado'>): Promise<void> {
    const usuarioId = await this.authService.getUserId();
    const uid = doc(collection(this.firestore, 'reportes')).id;
    const nuevoReporte: reporte = {
      ...reporteData,
      usuarioId,
      fechaCreacion: new Date(),
      estado: 'pendiente'
    };
    return setDoc(doc(this.firestore, 'reportes', uid), nuevoReporte);
  }


  // Obtener todos los reportes
  async obtenerReportes(): Promise<reporte[]> {
    const ref = collection(this.firestore, 'reportes');
    const q = query(ref, orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as reporte);
  }

  // Obtener los reportes con estado == pendiente
  async ObtenerReportesPendientes(): Promise<reporte[]>{
    const ref = collection(this.firestore, 'reportes');
    const q = query(ref, where('estado', '==' , 'pendiente'), orderBy('fechaCreacion', 'desc'))
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...(data as reporte),
        id: doc.id,
        fechaCreacion: data['fechaCreacion']?.toDate ? data['fechaCreacion'].toDate() : data['fechaCreacion']
      };
    });
  };

    // Obtener reportes de un usuario
  async obtenerReportesPorUsuario(usuarioId: string): Promise<reporte[]> {
    const ref = collection(this.firestore, 'reportes');
    const q = query(ref, where('usuarioId', '==', usuarioId), orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as reporte);
  }

  // Actualizar estado o justificación
  actualizarReporte(id: string, data: Partial<reporte>): Promise<void> {
    return updateDoc(doc(this.firestore, 'reportes', id), data);
  }
}
