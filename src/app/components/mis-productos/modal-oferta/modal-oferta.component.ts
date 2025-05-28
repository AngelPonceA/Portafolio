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

// Importar modelos
import { Producto } from 'src/app/models/producto.models';
import { Categoria } from 'src/app/models/categoria.models';

// Importar servicios
import { CrudService } from 'src/app/services/crud/crud.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Timestamp } from '@angular/fire/firestore';
import { Oferta } from 'src/app/models/oferta.models';

@Component({
  selector: 'app-modal-oferta',
  templateUrl: './modal-oferta.component.html',
  styleUrls: ['./modal-oferta.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ModalOfertaComponent implements OnInit {
  // Atributos de entrada
  // @Input() userId: string = '';
  userId: string = 'LtOy7x75rVTK4f56xhErfdDPEs92';
  @Input() initialProductData!: Producto;
  productoId: string = '';

  oferta = false;
  mostrarOferta: boolean = false;
  productos: Producto[] = [];

  // Variables para formulario
  nuevaOfertaForm: {
    precio_oferta: number;
    fecha_inicio: string;
    fecha_fin: string;
  } = {
    precio_oferta: 0,
    // new Date(ahora.getTime() - tzOffset).toISOString().slice(0, 16)
    fecha_inicio: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString()
      .slice(0, 16),
    fecha_fin: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString()
      .slice(0, 16),
  };

  // Salidas para notificar al componente padre sobre acciones
  @Output() ofertaGuardada = new EventEmitter<Producto>();
  @Output() modalCerrado = new EventEmitter<void>();

  constructor(
    private crudService: CrudService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  async guardarOferta(form: NgForm) {
    if (!form.valid || !this.initialProductData) {
      this.mostrarToast('Complete todos los campos', 'warning');
      return;
    }

    const productoId = this.initialProductData.producto_id;
    if (!productoId) {
      console.error('Error: ID del producto no definido.');
      this.mostrarToast(
        'Error al crear la oferta: ID del producto no válido',
        'danger'
      );
      return;
    }

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
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {},
          },
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
                console.error('Error: ID de la oferta anterior no definido.');
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
    try {
      const nuevaOferta: Oferta = {
        producto_id: initialProductData.producto_id,
        precio_oferta: this.nuevaOfertaForm.precio_oferta,
        fecha_inicio: Timestamp.fromDate(
          new Date(this.nuevaOfertaForm.fecha_inicio)
        ),
        fecha_fin: Timestamp.fromDate(new Date(this.nuevaOfertaForm.fecha_fin)),
      };

      const oferta = await this.crudService.guardarOferta(
        nuevaOferta,
        initialProductData
      );

      this.mostrarToast('Oferta guardada con éxito');

      this.cdr.detectChanges();

      this.mostrarOferta = false;
    } catch (error) {
      console.error('Error al guardar la oferta:', error);
      this.mostrarToast('Error al guardar la oferta', 'danger');
    }
  }

  // Validar ofertas
  validarOferta(oferta: Oferta, producto: Producto): boolean {
    if (oferta.precio_oferta <= 0) {
      this.mostrarToast('El precio de la oferta debe ser mayor a 0', 'warning');
      return false;
    }
    if (oferta.precio_oferta > producto.precio) {
      this.mostrarToast(
        'El precio de la oferta no puede ser mayor al precio normal',
        'warning'
      );
      return false;
    }
    if (oferta.fecha_fin < oferta.fecha_inicio) {
      this.mostrarToast(
        'La fecha de fin de la oferta no puede ser anterior a la fecha de inicio',
        'warning'
      );
      return false;
    }
    if (new Date(oferta.fecha_inicio) < new Date()) {
      this.mostrarToast(
        'La fecha de inicio de la oferta no puede ser anterior a la fecha actual',
        'warning'
      );
      return false;
    }
    if (new Date(oferta.fecha_fin) < new Date()) {
      this.mostrarToast(
        'La fecha de fin de la oferta no puede ser anterior a la fecha actual',
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

  abrirModalOferta(producto: Producto) {
    this.initialProductData = producto;

    const ahora = new Date();
    const tzOffset = ahora.getTimezoneOffset() * 60000;
    const ahoraLocalISO = new Date(ahora.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);

    this.nuevaOfertaForm = {
      precio_oferta: producto.oferta?.precio_oferta ?? 0,
      fecha_inicio: ahoraLocalISO,
      fecha_fin: ahoraLocalISO,
    };

    this.mostrarOferta = true;
  }

  async cerrarModal(actualizado = false) {
    await this.modalController.dismiss({
      actualizado,
    });
    this.modalCerrado.emit();
  }
}
