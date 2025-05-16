import { Injectable } from '@angular/core';
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
    //const usuarioId = await this.authService.getUserId();
    const usuarioId = 'kCnjHs7m1fWHHnavK2qvv2lRy2L2'
    const uid = doc(collection(this.firestore, 'solicitudes')).id;
    const nuevaSolicitud: solicitudSoporte = {
      ...soporte,
      usuarioId,
      fechaCreacion: new Date()
    };
    return setDoc(doc(this.firestore, 'solicitudes', uid), nuevaSolicitud);
  }

  // Enviar reporte de usuario
  async enviarReporte(reporteData: Omit<reporte, 'usuarioId' | 'fechaCreacion' | 'estado'>): Promise<void> {
    //const usuarioId = await this.authService.getUserId();
    const usuarioId = 'kCnjHs7m1fWHHnavK2qvv2lRy2L2'
    const uid = doc(collection(this.firestore, 'reportes')).id;
    const nuevoReporte: reporte = {
      ...reporteData,
      usuarioId,
      fechaCreacion: new Date(),
      estado: 'pendiente'
    };
    return setDoc(doc(this.firestore, 'reportes', uid), nuevoReporte);
  }

  // Obtener todas las solicitudes
  async obtenerSolicitudes(): Promise<solicitudSoporte[]> {
    const ref = collection(this.firestore, 'solicitudes');
    const q = query(ref, orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as solicitudSoporte);
  }

  // Obtener todos los reportes
  async obtenerReportes(): Promise<reporte[]> {
    const ref = collection(this.firestore, 'reportes');
    const q = query(ref, orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as reporte);
  }

  // Obtener solicitudes de un usuario
  async obtenerSolicitudesPorUsuario(usuarioId: string): Promise<solicitudSoporte[]> {
    const ref = collection(this.firestore, 'solicitudes');
    const q = query(ref, where('usuarioId', '==', usuarioId), orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as solicitudSoporte);
  }

  // Obtener reportes de un usuario
  async obtenerReportesPorUsuario(usuarioId: string): Promise<reporte[]> {
    const ref = collection(this.firestore, 'reportes');
    const q = query(ref, where('usuarioId', '==', usuarioId), orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as reporte);
  }

  // Actualizar estado o prioridad de solicitud
  actualizarSolicitud(id: string, data: Partial<solicitudSoporte>): Promise<void> {
    return updateDoc(doc(this.firestore, 'solicitudes', id), data);
  }

  // Actualizar estado, prioridad o respuesta del reporte
  actualizarReporte(id: string, data: Partial<reporte>): Promise<void> {
    return updateDoc(doc(this.firestore, 'reportes', id), data);
  }
}
