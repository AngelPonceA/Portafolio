import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Boleta } from 'src/app/models/boleta/boleta.models';

@Component({
  selector: 'app-modal-boleta',
  templateUrl: './modal-boleta.component.html',
  styleUrls: ['./modal-boleta.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
  standalone: true
})
export class ModalBoletaComponent implements OnInit {
  @Input() detalleBoleta!: Boleta;

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}
}
