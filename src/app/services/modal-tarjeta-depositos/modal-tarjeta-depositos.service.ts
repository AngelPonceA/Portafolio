import { Injectable, Injector } from '@angular/core';
import { ModalTarjetaDepositosComponent } from 'src/app/components/modal-tarjeta-depositos/modal-tarjeta-depositos.component';
import { createCustomElement } from '@angular/elements';
import { ApplicationRef } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';

const MODAL_TAG = 'app-modal-tarjeta-depositos';

@Injectable({
  providedIn: 'root'
})
export class ModalTarjetaDepositosService {

  private modalDefined = false;

  constructor(
    private injector: Injector,
    private authService: AuthService,
    private firestore: Firestore
  ) {}
  
  private defineModalElement() {
    if (!this.modalDefined && !customElements.get(MODAL_TAG)) {
      const ModalElement = createCustomElement(ModalTarjetaDepositosComponent, {
        injector: this.injector,
      });
      customElements.define(MODAL_TAG, ModalElement);
      this.modalDefined = true;
    }
  }

  mostrarModal(): Promise<any> {
    this.defineModalElement();
    return new Promise((resolve, reject) => {
      const modalElement = document.createElement(MODAL_TAG);

      modalElement.addEventListener('submit', (e: any) => {
        document.body.removeChild(modalElement);
        resolve(e.detail);
      });

      modalElement.addEventListener('cancel', () => {
        document.body.removeChild(modalElement);
        reject();
      });

      document.body.appendChild(modalElement);
    });
  }

  mostrarModalConDatos(datos: any): Promise<any> {
    this.defineModalElement();
    return new Promise((resolve, reject) => {
      const modalElement = document.createElement(MODAL_TAG);

      modalElement.setAttribute('datos-iniciales', JSON.stringify(datos));

      modalElement.addEventListener('submit', (e: any) => {
        document.body.removeChild(modalElement);
        resolve(e.detail);
      });

      modalElement.addEventListener('cancel', () => {
        document.body.removeChild(modalElement);
        reject();
      });

      document.body.appendChild(modalElement);
    });
  }

  async guardarDatosBancarios(datos: any) {
    const sesion = await this.authService.obtenerSesion();
    const uid = sesion.id;
    const datosRef = doc(this.firestore, 'datosBancarios', uid);

    const datosBancarios = {
      ...datos,
      actualizado: new Date().toISOString(),
    };

    await setDoc(datosRef, datosBancarios, { merge: true });
  }


  async obtenerDatosBancarios(): Promise<any> {
    const sesion = await this.authService.obtenerSesion();
    const uid = sesion.id;
    const datosRef = doc(this.firestore, 'datosBancarios', uid);
    const datosDoc = await getDoc(datosRef);

    if (datosDoc.exists()) {
      return datosDoc.data();
    } else {
      return null;
    }
  }

}
