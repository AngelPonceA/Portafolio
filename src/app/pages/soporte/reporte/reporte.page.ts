import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import imageCompression from 'browser-image-compression';
import { reporte } from 'src/app/models/soporte/reporte.models';
import { SoporteService } from 'src/app/services/soporte/soporte.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: false,
})
export class ReportePage implements OnInit {
  formularioReporte: FormGroup;
  imagenesProcesadas: string[] = [];
  imagenesSeleccionadas: { file: File; preview: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private soporteService: SoporteService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.formularioReporte = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      motivo: ['', Validators.required],
      usuarioReportado: ['', Validators.required],
    });
  }

  ngOnInit() {}

  // ========================= Enviar Reporte =========================
  async enviarReporte() {
    if (this.formularioReporte.invalid) {
      this.mostrarToast('Por favor completa todos los campos', 'danger');
      return;
    }

    const formValue = this.formularioReporte.value;

    const reporteData: Omit<reporte, 'usuarioId' | 'fechaCreacion' | 'estado'> =
      {
        titulo: formValue.titulo,
        descripcion: formValue.descripcion,
        motivo: formValue.motivo,
        usuarioReportado: formValue.usuarioReportado,
      };

    if (this.imagenesProcesadas.length > 0) {
      reporteData.imagenes = this.imagenesProcesadas;
    }

      try {
        await this.soporteService.enviarReporte(reporteData);
        this.mostrarToast('Reporte enviado correctamente');
        this.formularioReporte.reset();
        this.imagenesProcesadas = [];
        this.imagenesSeleccionadas = []; 
      } catch (error) {
        console.error('Error al enviar reporte:', error);
        this.mostrarToast('Error al enviar el reporte', 'danger');
      }

  }

  // ========================= Métodos de imagenes =========================
  async compressImage(file: File): Promise<File | null> {
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      console.log('Tamaño original:', file.size / 1024 / 1024, 'MB');
      console.log(
        'Tamaño comprimido:',
        compressedFile.size / 1024 / 1024,
        'MB'
      );
      return compressedFile;
    } catch (error) {
      console.error('Error al comprimir la imagen:', error);
      this.mostrarToast('Error al comprimir una imagen', 'danger');
      return null;
    }
  }

procesarImagenes(event: any) {
  const files: FileList = event.target.files;

  this.imagenesSeleccionadas = [];
  this.imagenesProcesadas = []; 

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.imagenesSeleccionadas.push({
        file: file,
        preview: e.target.result,
      });
    };

    reader.readAsDataURL(file);

    this.compressAndReadImage(file);
  }
}

  eliminarImagen(index: number) {
    this.imagenesSeleccionadas.splice(index, 1);
  }

  async compressAndReadImage(file: File): Promise<void> {
    const compressedFile = await this.compressImage(file);
    if (compressedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenesProcesadas.push(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    }
  }

  // ========================= Comportamiento =========================
  async mostrarToast(mensaje: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
    });
    await toast.present();
  }

  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  esArray(val: any): boolean {
    return Array.isArray(val);
  }
}
