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
    await this.ionicService.mostrarCargando('Generando PDF');

    const element = document.querySelector('.boleta-card') as HTMLElement;

    if (!element) {
      await this.ionicService.ocultarCargando();
      console.error('No se encontró el elemento .boleta-card');
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Páginas adicionales si es necesario
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfOutput = pdf.output('datauristring');
      const base64 = pdfOutput.split(',')[1];
      const fileName = `boleta-${this.detalleBoleta.ordenCompra}.pdf`;

      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents
      });

      await this.ionicService.ocultarCargando();
      this.ionicService.mostrarToastAbajo('Boleta descargada correctamente');
      console.log('Boleta PDF guardada en:', fileName);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      await this.ionicService.ocultarCargando();
      this.ionicService.mostrarAlerta('Error', 'No se pudo generar la boleta');
    }
  }

  ngOnInit() {}
}
