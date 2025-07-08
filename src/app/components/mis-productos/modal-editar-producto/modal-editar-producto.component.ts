import {
  Component,
  Output,
  OnInit,
  EventEmitter,
  Input,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  ModalController,
} from '@ionic/angular';
import imageCompression from 'browser-image-compression';

import { Producto } from 'src/app/models/producto.models';
import { Categoria } from 'src/app/models/categoria.models';
import { CrudService } from 'src/app/services/crud/crud.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UbicacionService } from 'src/app/services/ubicacion/ubicacion.service';

@Component({
  selector: 'app-modal-editar-producto',
  templateUrl: './modal-editar-producto.component.html',
  styleUrls: ['./modal-editar-producto.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ModalEditarProductoComponent implements OnInit, OnChanges {
  @Input() userId: string = '';
  @Input() initialProductData!: Producto;
  productoId: string = '';
  regiones: any[] = [];
  comunas: string[] = [];
  estados = ['nuevo', 'segunda mano'];
  nuevaEtiqueta = '';
  categorias: Categoria[] = [];

  @Output() productSaved = new EventEmitter<Producto>();
  @Output() modalClosed = new EventEmitter<void>();

  nuevoProductoEditadoForm: Producto = {
    usuario_id: this.userId,
    categoria: '',
    titulo: '',
    descripcion: '',
    etiquetas: [],
    estado: '',
    precio: 0,
    stock: 0,
    inventario_minimo: 0,
    auto_stock: false,
    imagen: [],
    direccionOrigen: {
      region: '',
      comuna: '',
      calle: '',
      numero: 0,
      departamento: '',
      descripcion: '',
    },
  };

  tocado: any = {};

  tocarCampo(campo: string) {
    this.tocado[campo] = true;
  }

  // Métodos de validación por campo
  tituloValido(): boolean {
    const t = this.nuevoProductoEditadoForm.titulo;
    return typeof t === 'string' && t.trim().length >= 3;
  }
  descripcionValida(): boolean {
    const d = this.nuevoProductoEditadoForm.descripcion;
    return typeof d === 'string' && d.trim().length >= 10;
  }
  estadoValido(): boolean {
    const v = this.nuevoProductoEditadoForm.estado;
    return ['nuevo', 'segunda mano'].includes((v || '').toLowerCase());
  }
  categoriaValida(): boolean {
    return (
      typeof this.nuevoProductoEditadoForm.categoria === 'string' &&
      this.nuevoProductoEditadoForm.categoria.trim() !== ''
    );
  }
  etiquetasValidas(): boolean {
    return (
      Array.isArray(this.nuevoProductoEditadoForm.etiquetas) &&
      this.nuevoProductoEditadoForm.etiquetas.length > 0
    );
  }
  precioValido(): boolean {
    const p = this.nuevoProductoEditadoForm.precio;
    return typeof p === 'number' && !isNaN(p) && p > 0;
  }
  stockValido(): boolean {
    const s = this.nuevoProductoEditadoForm.stock;
    return typeof s === 'number' && !isNaN(s) && s >= 0;
  }
  regionValida(): boolean {
    const r = this.nuevoProductoEditadoForm.direccionOrigen.region;
    return typeof r === 'string' && r.trim() !== '';
  }
  comunaValida(): boolean {
    const c = this.nuevoProductoEditadoForm.direccionOrigen.comuna;
    return typeof c === 'string' && c.trim() !== '';
  }
  calleValida(): boolean {
    const c = this.nuevoProductoEditadoForm.direccionOrigen.calle;
    return typeof c === 'string' && c.trim() !== '';
  }
  numeroValido(): boolean {
    const n = this.nuevoProductoEditadoForm.direccionOrigen.numero;
    return typeof n === 'number' && !isNaN(n) && n > 0;
  }
  imagenesValidas(): boolean {
    return (
      Array.isArray(this.nuevoProductoEditadoForm.imagen) &&
      this.nuevoProductoEditadoForm.imagen.length > 0
    );
  }

  formularioValido(): boolean {
    return (
      this.tituloValido() &&
      this.descripcionValida() &&
      this.estadoValido() &&
      this.categoriaValida() &&
      this.etiquetasValidas() &&
      this.precioValido() &&
      this.stockValido() &&
      this.regionValida() &&
      this.comunaValida() &&
      this.calleValida() &&
      this.numeroValido() &&
      this.imagenesValidas()
    );
  }

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private crudService: CrudService,
    private authService: AuthService,
    private ubicacionService: UbicacionService
  ) {}

  ngOnInit() {
    this.obtenerCategorias();
    this.regiones = this.ubicacionService.getRegiones();
    this.cargarDatosProducto();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialProductData']) {
      this.cargarDatosProducto();
    }
  }

  onRegionChange(event: any) {
    const regionNombre = event.detail.value;
    const regionSeleccionada = this.regiones.find(
      (r) => r.nombre === regionNombre
    );
    if (regionSeleccionada) {
      this.comunas = regionSeleccionada.comunas;
      this.nuevoProductoEditadoForm.direccionOrigen.comuna = '';
    } else {
      this.comunas = [];
    }
  }

  cargarDatosProducto() {
    if (this.initialProductData) {
      this.productoId = this.initialProductData.producto_id || '';
      const direccionRaw = this.initialProductData.direccionOrigen;
      const direccion = Array.isArray(direccionRaw)
        ? direccionRaw[0]
        : direccionRaw || {
            region: '',
            comuna: '',
            calle: '',
            numero: 0,
            departamento: '',
            descripcion: '',
          };

      this.nuevoProductoEditadoForm = {
        ...this.initialProductData,
        direccionOrigen: direccion,
      };

      const regionObj = this.regiones.find(
        (r) => r.nombre === direccion.region
      );
      this.comunas = regionObj ? regionObj.comunas : [];
    } else {
      this.resetearFormularioProductoEditado();
    }
  }

  async guardarProductoEditado() {
    this.tocarCampo('submit');
    if (!this.formularioValido()) return;

    try {
      this.nuevoProductoEditadoForm.usuario_id = this.userId;
      const cleanProducto = JSON.parse(
        JSON.stringify(this.nuevoProductoEditadoForm)
      );
      await this.crudService.editarProducto(this.productoId, cleanProducto);

      this.productSaved.emit(this.nuevoProductoEditadoForm);
      this.mostrarToast('Producto editado correctamente', 'success');
      await this.cerrarModal(true);
    } catch (error) {
      this.mostrarToast('Error al editar el producto', 'danger');
      console.error('Error al editar el producto:', error);
    }
  }

  agregarEtiqueta() {
    if (
      this.nuevaEtiqueta.trim() !== '' &&
      !this.nuevoProductoEditadoForm.etiquetas.includes(
        this.nuevaEtiqueta.trim()
      )
    ) {
      this.nuevoProductoEditadoForm.etiquetas.push(this.nuevaEtiqueta.trim());
      this.nuevaEtiqueta = '';
    }
  }
  eliminarEtiqueta(etiqueta: string) {
    this.nuevoProductoEditadoForm.etiquetas =
      this.nuevoProductoEditadoForm.etiquetas.filter((e) => e !== etiqueta);
  }

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
    const archivos = event.target.files;
    if (archivos && archivos.length > 0) {
      this.nuevoProductoEditadoForm.imagen = [];
      for (const file of archivos) {
        this.compressAndReadImage(file);
      }
    }
  }
  async compressAndReadImage(file: File): Promise<void> {
    const compressedFile = await this.compressImage(file);
    if (compressedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.nuevoProductoEditadoForm.imagen.push(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    }
  }
  eliminarImagen(index: number) {
    this.nuevoProductoEditadoForm.imagen.splice(index, 1);
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
    await this.modalController.dismiss({
      actualizado,
    });
    this.modalClosed.emit();
  }

  resetearFormularioProductoEditado() {
    this.nuevoProductoEditadoForm = {
      usuario_id: this.userId,
      titulo: '',
      descripcion: '',
      categoria: '',
      etiquetas: [],
      precio: 0,
      stock: 0,
      estado: '',
      inventario_minimo: 0,
      auto_stock: false,
      imagen: [],
      direccionOrigen: {
        region: '',
        comuna: '',
        calle: '',
        numero: 0,
        departamento: '',
        descripcion: '',
      },
    };
    this.nuevaEtiqueta = '';
  }

  async obtenerCategorias() {
    try {
      this.crudService.obtenerCategorias().subscribe({
        next: (categorias) => {
          this.categorias = categorias;
        },
        error: (error) => {
          console.error('Error al obtener las categorías:', error);
          this.mostrarToast('Error al cargar las categorías', 'danger');
        },
      });
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
      this.mostrarToast('Error al cargar las categorías', 'danger');
    }
  }
}
