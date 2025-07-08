import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UbicacionService } from 'src/app/services/ubicacion/ubicacion.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-modal-form-nueva-direccion',
  templateUrl: './modal-form-nueva-direccion.component.html',
  styleUrls: ['./modal-form-nueva-direccion.component.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule]
})
export class ModalFormNuevaDireccionComponent implements OnInit {
  direccionForm: FormGroup;
  regiones: any[] = [];
  comunas: string[] = [];
  isLoading = false;
  direcciones: any[] = [];
  mostrarFormulario = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private ubicacionService: UbicacionService,
    private authService: AuthService,
    private crudService: CrudService
  ) {
    this.direccionForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      calle: ['', [Validators.required, Validators.minLength(3)]],
      numero: ['', [Validators.required, Validators.minLength(1)]],
      departamento: [''],
      descripcion: ['', [Validators.minLength(10)]],
      region: ['', Validators.required],
      comuna: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.regiones = this.ubicacionService.getRegiones();
    const uid = await this.authService.getUserId();
    this.direcciones = await this.ubicacionService.obtenerDireccionesPorUsuario(uid);
    this.mostrarFormulario = this.direcciones.length === 0;
  }

  seleccionarDireccion(dir: any) {
    this.modalCtrl.dismiss(dir, 'confirm');
  }

  onRegionChange(event: any) {
    const regionId = event.detail.value;
    const regionSeleccionada = this.regiones.find(r => r.id === regionId);
    if (regionSeleccionada) {
      this.comunas = regionSeleccionada.comunas;
      this.direccionForm.get('comuna')?.reset();
    } else {
      this.comunas = [];
    }
  }

  async onSubmit() {
    if (this.direccionForm.invalid) {
      this.markFormGroupTouched(this.direccionForm);
      return;
    }

    this.isLoading = true;
    
    try {
      const usuario_id = await this.authService.getUserId();
      const nuevaDireccion = {
        nombres: this.direccionForm.value.nombres,
        apellidos: this.direccionForm.value.apellidos,
        telefono: this.direccionForm.value.telefono,
        calle: this.direccionForm.value.calle,
        numero: this.direccionForm.value.numero,
        departamento: this.direccionForm.value.departamento,
        descripcion: this.direccionForm.value.descripcion,
        region: this.regiones.find(r => r.id === this.direccionForm.value.region)?.nombre,
        comuna: this.direccionForm.value.comuna,
        usuario_id: usuario_id || '',
        fecha_creacion: new Date().toISOString()
      };

      await this.crudService.guardarDireccion(nuevaDireccion);
      this.mostrarFormulario = false;
      this.direccionForm.reset();
      this.cargarDirecciones();     
      await this.modalCtrl.dismiss(nuevaDireccion, 'confirm');
    } catch (error) {
      console.error('Error al guardar dirección:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private async cargarDirecciones() {
    const uid = await this.authService.getUserId();
    this.direcciones = await this.ubicacionService.obtenerDireccionesPorUsuario(uid);
  }
}
