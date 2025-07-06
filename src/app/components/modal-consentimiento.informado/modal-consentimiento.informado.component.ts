import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-modal-consentimiento.informado',
  templateUrl: './modal-consentimiento.informado.component.html',
  styleUrls: ['./modal-consentimiento.informado.component.scss'],
  standalone: false
})
export class ModalConsentimientoInformadoComponent {

  constructor(  private modalCtrl: ModalController,   
                private router: Router
  ) { }

  cerrar(aceptado: boolean) {
    this.modalCtrl.dismiss(aceptado ? {aceptado: true} : null);
  }

  abrirTerminos() {
    this.modalCtrl.dismiss(); 
    this.router.navigate(['/terminos-ycondiciones']);
  }
}
