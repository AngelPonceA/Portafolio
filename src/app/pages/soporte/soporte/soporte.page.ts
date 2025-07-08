import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import imageCompression from 'browser-image-compression';
import { solicitudSoporte } from 'src/app/models/soporte/soporte.models';
import { SoporteService } from 'src/app/services/soporte/soporte.service';

function noSoloEspacios(control: AbstractControl): ValidationErrors | null {
  return control.value && control.value.trim() !== '' ? null : { soloEspacios: true };
}

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
      titulo: ['', [Validators.required, noSoloEspacios]],
      descripcion: ['', [Validators.required, Validators.maxLength(300), noSoloEspacios]],
      motivo: ['', Validators.required],
    });
  }

  ngOnInit() {}

  async enviarSolicitud() {
    if (this.formularioSoporte.invalid) {
      this.formularioSoporte.markAllAsTouched();
      this.mostrarToast('Por favor completa todos los campos', 'danger');
      return;
    }

    const formValue = this.formularioSoporte.value;

    const solicitud: Omit<solicitudSoporte, 'usuarioId' | 'fechaCreacion' | 'prioridad'> = {
      titulo: formValue.titulo.trim(),
      descripcion: formValue.descripcion.trim(),
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
  async compressImage(file: File): Promise<File | null> {
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
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

  esArray(val: any): boolean {
    return Array.isArray(val);
  }
}
