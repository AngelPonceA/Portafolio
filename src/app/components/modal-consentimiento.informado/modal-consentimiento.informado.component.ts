import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-modal-consentimiento.informado',
  templateUrl: './modal-consentimiento.informado.component.html',
  styleUrls: ['./modal-consentimiento.informado.component.scss'],
  standalone: false
})
export class ModalConsentimientoInformadoComponent {

  constructor(private modalCtrl: ModalController) { }

  closeModal(aceptado: boolean) {
    this.modalCtrl.dismiss(aceptado ? {aceptado: true} : null);
  }

}
