import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import imageCompression from 'browser-image-compression';
import { solicitudSoporte } from 'src/app/models/soporte/soporte.models';
import { SoporteService } from 'src/app/services/soporte/soporte.service';

@Component({
  selector: 'app-soporte',
  templateUrl: './soporte.page.html',
  styleUrls: ['./soporte.page.scss'],
  standalone: false
})
export class SoportePage implements OnInit {
  formularioSoporte: FormGroup;
  imagenesProcesadas: string[] = [];
  imagenesSeleccionadas: { file: File; preview: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private soporteService: SoporteService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.formularioSoporte = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      motivo: ['', Validators.required],
    });
  }

  ngOnInit() {}

  async enviarSolicitud() {
    if (this.formularioSoporte.invalid) {
      this.mostrarToast('Por favor completa todos los campos', 'danger');
      return;
    }

    const formValue = this.formularioSoporte.value;

    const solicitud: Omit<solicitudSoporte, 'usuarioId' | 'fechaCreacion' | 'prioridad'> = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      motivo: formValue.motivo,
      estado: 'pendiente'
    };

    if (this.imagenesProcesadas.length > 0) {
      solicitud.imagenes = this.imagenesProcesadas;
    }

    try {
      await this.soporteService.enviarSolicitud(solicitud);
      this.mostrarToast('Solicitud enviada correctamente');
      this.formularioSoporte.reset();
      this.imagenesProcesadas = [];
      this.imagenesSeleccionadas = [];
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      this.mostrarToast('Error al enviar la solicitud', 'danger');
    }
  }

  // ===================== Imagenes =====================

  procesarImagenes(event: any) {
    const files: FileList = event.target.files;
    this.imagenesSeleccionadas = [];
    this.imagenesProcesadas = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        this.imagenesSeleccionadas.push({
          file: file,
          preview: e.target.result,
        });

        const compressed = await this.compressImage(file);
        if (compressed) {
          const reader2 = new FileReader();
          reader2.onload = () => {
            this.imagenesProcesadas.push(reader2.result as string);
          };
          reader2.readAsDataURL(compressed);
        }
      };

      reader.readAsDataURL(file);
    }
  }

  async compressImage(file: File): Promise<File | null> {
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Error al comprimir imagen:', error);
      this.mostrarToast('Error al comprimir una imagen', 'danger');
      return null;
    }
  }

  eliminarImagen(index: number) {
    this.imagenesSeleccionadas.splice(index, 1);
    this.imagenesProcesadas.splice(index, 1);
  }

  // ===================== Comportamiento =====================

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
}
