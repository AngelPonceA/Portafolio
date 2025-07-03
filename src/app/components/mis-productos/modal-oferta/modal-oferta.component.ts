import {
  Component,
  Output,
  OnInit,
  EventEmitter,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  ModalController,
} from '@ionic/angular';

import { Producto } from 'src/app/models/producto.models';
import { CrudService } from 'src/app/services/crud/crud.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Timestamp } from '@angular/fire/firestore';
import { Oferta } from 'src/app/models/oferta.models';

@Component({
  selector: 'app-modal-oferta',
  templateUrl: './modal-oferta.component.html',
  styleUrls: ['./modal-oferta.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ModalOfertaComponent implements OnInit {
  @Input() userId: string = '';
  @Input() initialProductData!: Producto;
  @Output() ofertaGuardada = new EventEmitter<Producto>();
  @Output() modalCerrado = new EventEmitter<void>();

  nuevaOfertaForm = {
    precio_oferta: 0,
    fecha_inicio: '',
    fecha_fin: '',
  };

  constructor(
    private crudService: CrudService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.inicializarFormularioOferta();
  }

  async guardarOferta(form: NgForm) {
    if (!form.valid || !this.initialProductData) {
      this.mostrarToast('Complete todos los campos', 'warning');
      return;
    }

    const fechaForzada = this.obtenerFechaActualMasUnMinutoISO();
    const fechaInicioUsuario = new Date(this.nuevaOfertaForm.fecha_inicio);

    // Si la fecha del usuario es en el pasado, o muy cerca, la forzamos
    if (fechaInicioUsuario < new Date()) {
      this.nuevaOfertaForm.fecha_inicio = fechaForzada;
    }

    const productoId = this.initialProductData.producto_id ?? '';
    const nuevaOferta: Oferta = {
      producto_id: productoId,
      precio_oferta: this.nuevaOfertaForm.precio_oferta,
      fecha_inicio: new Date(this.nuevaOfertaForm.fecha_inicio),
      fecha_fin: new Date(this.nuevaOfertaForm.fecha_fin),
    };

    const esValida = this.validarOferta(nuevaOferta, this.initialProductData);
    if (!esValida) return;

    const ofertasExistentes = await this.crudService.obtenerOfertaPorProducto(
      productoId
    );

    if (ofertasExistentes.length > 0) {
      const alerta = await this.alertController.create({
        header: 'Oferta existente',
        message:
          'Este producto ya tiene una oferta activa. ¿Deseas reemplazarla?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Reemplazar',
            handler: async () => {
              const ofertaAnterior = ofertasExistentes[0];
              if (ofertaAnterior?.id) {
                await this.crudService.eliminarOferta(ofertaAnterior.id);
                await this.crearNuevaOferta(this.initialProductData);
                this.mostrarToast(
                  'Oferta reemplazada correctamente',
                  'success'
                );
                await this.cerrarModal(true);
              } else {
                this.mostrarToast('Error al reemplazar la oferta', 'danger');
                await this.cerrarModal(false);
              }
            },
          },
        ],
      });
      await alerta.present();
    } else {
      await this.crearNuevaOferta(this.initialProductData);
      this.mostrarToast('Oferta creada correctamente', 'success');
      await this.cerrarModal(true);
    }
  }

  async crearNuevaOferta(initialProductData: Producto) {
    const fechaSegura = this.obtenerFechaActualMasUnMinutoISO();

    if (new Date(this.nuevaOfertaForm.fecha_inicio) < new Date()) {
      this.nuevaOfertaForm.fecha_inicio = fechaSegura;
    }

    const nuevaOferta: Oferta = {
      producto_id: initialProductData.producto_id ?? '',
      precio_oferta: this.nuevaOfertaForm.precio_oferta,
      fecha_inicio: Timestamp.fromDate(
        new Date(this.nuevaOfertaForm.fecha_inicio)
      ),
      fecha_fin: Timestamp.fromDate(new Date(this.nuevaOfertaForm.fecha_fin)),
    };

    try {
      await this.crudService.guardarOferta(nuevaOferta, initialProductData);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al guardar la oferta:', error);
      this.mostrarToast('Error al guardar la oferta', 'danger');
    }
  }

  validarOferta(oferta: Oferta, producto: Producto): boolean {
    if (oferta.precio_oferta <= 0) {
      this.mostrarToast('El precio de la oferta debe ser mayor a 0', 'warning');
      return false;
    }
    if (oferta.precio_oferta > producto.precio) {
      this.mostrarToast(
        'El precio de la oferta no puede superar el precio original',
        'warning'
      );
      return false;
    }
    if (oferta.fecha_fin < oferta.fecha_inicio) {
      this.mostrarToast(
        'La fecha de fin no puede ser anterior a la de inicio',
        'warning'
      );
      return false;
    }
    if (new Date(oferta.fecha_inicio) < new Date()) {
      this.mostrarToast(
        'La fecha de inicio no puede estar en el pasado',
        'warning'
      );
      return false;
    }
    if (new Date(oferta.fecha_fin) < new Date()) {
      this.mostrarToast(
        'La fecha de fin no puede estar en el pasado',
        'warning'
      );
      return false;
    }
    return true;
  }

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color,
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await toast.present();
  }

  async cerrarModal(actualizado = false) {
    await this.modalController.dismiss({ actualizado });
    this.modalCerrado.emit();
  }

  private obtenerFechaActualMasUnMinutoISO(): string {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() + 1);
    const tzOffset = ahora.getTimezoneOffset() * 60000;
    return new Date(ahora.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  private inicializarFormularioOferta(): void {
    const fechaInicio = this.obtenerFechaActualMasUnMinutoISO();
    const precio = this.initialProductData?.precio ?? 0;

    this.nuevaOfertaForm = {
      precio_oferta: precio,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaInicio,
    };
  }
}
