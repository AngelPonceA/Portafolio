import { Component, Output, OnInit, EventEmitter, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  ModalController
} from '@ionic/angular';
import imageCompression from 'browser-image-compression';

// Importar modelos
import { Producto } from 'src/app/models/producto.models';
import { Categoria } from 'src/app/models/categoria.models';

// Importar servicios
import { CrudService } from 'src/app/services/crud/crud.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-modal-editar-producto',
  templateUrl: './modal-editar-producto.component.html',
  styleUrls: ['./modal-editar-producto.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ModalEditarProductoComponent implements OnInit, OnChanges{
  //@Input() userId: string = '';
  userId: string = 'LtOy7x75rVTK4f56xhErfdDPEs92';

  @Input() initialProductData!: Producto;
  productoId: string = '';

  // Detectar cambios en las propiedades de entrada
  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialProductData']) {
      this.cargarDatosProducto();
    }
  }

  // Salidas para notificar al componente padre sobre acciones
  @Output() productSaved = new EventEmitter<Producto>();
  @Output() modalClosed = new EventEmitter<void>();

  // Variables para formulario
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
  };

  estados = ['nuevo', 'segunda mano'];
  nuevaEtiqueta = '';
  categorias: Categoria[] = [];

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private crudService: CrudService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.obtenerCategorias();
    this.cargarDatosProducto();
  }

  cargarDatosProducto() {
    if (this.initialProductData) {
      this.nuevoProductoEditadoForm = { ...this.initialProductData};
      this.productoId = this.initialProductData.producto_id || '';
    } else {
      this.resetearFormularioProductoEditado();
    }
  }

  async guardarProductoEditado() {
    try {
      this.nuevoProductoEditadoForm.usuario_id = this.userId;

      const esValido = await this.validarProducto(
        this.nuevoProductoEditadoForm
      );

      if (!esValido) {
        return;
      }

      await this.crudService.editarProducto(
        this.productoId,
        this.nuevoProductoEditadoForm
      );
      this.productSaved.emit(this.nuevoProductoEditadoForm);
      this.mostrarToast('Producto editado correctamente', 'success');
      await this.cerrarModal(true);
    } catch (error) {
      this.mostrarToast('Error al editar el producto', 'danger');
      console.error('Error al editar el producto:', error);
    }
  }

  async validarProducto(producto: Producto): Promise<boolean> {
    if (producto.titulo.trim() === '') {
      this.mostrarToast('El título no puede estar vacío', 'warning');
      return false;
    }
    if (producto.descripcion.trim() === '') {
      this.mostrarToast('La descripción no puede estar vacía', 'warning');
      return false;
    }
    if (producto.categoria.trim() === '') {
      this.mostrarToast('La categoría no puede estar vacía', 'warning');
      return false;
    }
    if (producto.precio <= 0) {
      this.mostrarToast('El precio debe ser mayor a 0', 'warning');
      return false;
    }
    if (producto.stock < 0) {
      this.mostrarToast('El stock no puede ser negativo', 'warning');
      return false;
    }
    if (producto.etiquetas.length === 0) {
      this.mostrarToast(
        'El producto debe tener al menos una etiqueta',
        'warning'
      );
      return false;
    }
    if (producto.imagen.length === 0) {
      this.mostrarToast(
        'El producto debe tener al menos una imagen',
        'warning'
      );
      return false;
    }
    if (producto.estado.trim() === '') {
      this.mostrarToast('El estado no puede estar vacío', 'warning');
      return false;
    }
    return true;
  }

  // Métodos de categorías
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

  // Método toast
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

  // Métodos para etiquetas
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

  // Métodos para imágenes
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
      this.nuevoProductoEditadoForm.imagen = []; // Limpiar imagenes
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
    };
    this.nuevaEtiqueta = '';
  }
}
