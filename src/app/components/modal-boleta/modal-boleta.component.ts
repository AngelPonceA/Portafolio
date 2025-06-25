import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Boleta } from 'src/app/models/boleta/boleta.models';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { IonicService } from 'src/app/services/ionic/ionic.service';

@Component({
  selector: 'app-modal-boleta',
  templateUrl: './modal-boleta.component.html',
  styleUrls: ['./modal-boleta.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
  standalone: true
})
export class ModalBoletaComponent implements OnInit {
  @Input() detalleBoleta!: Boleta;

  constructor(private modalCtrl: ModalController, 
              private ionicService: IonicService) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async descargarBoletaComoPDF() {
    this.ionicService.mostrarCargando('Generando PDF')
    const element = document.querySelector('.boleta-card') as HTMLElement;

    if (!element) {
      console.error('No se encontró el elemento .boleta-card');
      return;
    }

    // Captura visual
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    // Crea PDF con jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    const pdfWidth = pageWidth;
    const pdfHeight = pageWidth / imgRatio;

    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);

    // Exporta a base64
    const pdfOutput = pdf.output('datauristring');
    const base64 = pdfOutput.split(',')[1]; // quitar "data:application/pdf;base64,"

    const fileName = `boleta-${this.detalleBoleta.ordenCompra}.pdf`;

    // Guarda en filesystem
    await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Documents
    });


    console.log('Boleta PDF guardada en:', fileName);
  }

  ngOnInit() {}
}
