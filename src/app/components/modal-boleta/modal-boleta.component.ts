import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-boleta',
  templateUrl: './modal-boleta.component.html',
  styleUrls: ['./modal-boleta.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ModalBoletaComponent  implements OnInit {
@Input() detalleBoleta: any;

  constructor(
    private modalCtrl: ModalController
  ) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}

}
