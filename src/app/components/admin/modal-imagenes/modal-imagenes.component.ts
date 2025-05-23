import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  imports: [CommonModule, IonicModule],
  templateUrl: './modal-imagenes.component.html',
  styleUrls: ['./modal-imagenes.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class ModalImagenesComponent{

  @Input() imagenes: string[] = [];

  constructor(private modalCtrl: ModalController) {}

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
