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

// Importar modelos
import { Producto } from 'src/app/models/producto.models';
import { Categoria } from 'src/app/models/categoria.models';

// Importar servicios
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
    direccionOrigen: {
      region: '',
      comuna: '',
      calle: '',
      numero: 0,
      departamento: '',
      descripcion: '',
    },
  };

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

  // Detectar cambios en las propiedades de entrada
  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialProductData']) {
      this.cargarDatosProducto();
    }
  }

  onRegionChange(event: any) {
    const regionNombre = event.detail.value;

    const regionSeleccionada = this.regiones.find(r => r.nombre === regionNombre);

    if (regionSeleccionada) {
      this.comunas = regionSeleccionada.comunas;
      this.nuevoProductoEditadoForm.direccionOrigen.comuna = ''; // reset comuna
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

    const regionObj = this.regiones.find(r => r.nombre === direccion.region);
    this.comunas = regionObj ? regionObj.comunas : [];
  } else {
    this.resetearFormularioProductoEditado();
  }
}


  async guardarProductoEditado() {
    try {
        this.nuevoProductoEditadoForm.usuario_id = this.userId;

        const esValido = await this.validarProducto(this.nuevoProductoEditadoForm);
        if (!esValido) return;

        console.log('Editando producto ID:', this.productoId);
        console.log('Datos enviados:', this.nuevoProductoEditadoForm);

        const cleanProducto = JSON.parse(JSON.stringify(this.nuevoProductoEditadoForm));
        await this.crudService.editarProducto(this.productoId, cleanProducto);


        this.productSaved.emit(this.nuevoProductoEditadoForm);
        this.mostrarToast('Producto editado correctamente', 'success');
        await this.cerrarModal(true);
      } catch (error) {
        this.mostrarToast('Error al editar el producto', 'danger');
        console.error('Error al editar el producto:', error);
      }
    } 

  async validarProducto(producto: Producto): Promise<boolean> {
    if (typeof producto.titulo !== 'string' || producto.titulo.trim().length < 3) {
      this.mostrarToast('El título debe tener al menos 3 caracteres', 'warning');
      return false;
    }

    if (typeof producto.descripcion !== 'string' || producto.descripcion.trim().length < 10) {
      this.mostrarToast('La descripción debe tener al menos 10 caracteres', 'warning');
      return false;
    }

    if (typeof producto.categoria !== 'string' || producto.categoria.trim() === '') {
      this.mostrarToast('La categoría es obligatoria', 'warning');
      return false;
    }

    if (typeof producto.precio !== 'number' || isNaN(producto.precio) || producto.precio <= 0) {
      this.mostrarToast('El precio debe ser un número mayor a 0', 'warning');
      return false;
    }

    if (typeof producto.stock !== 'number' || isNaN(producto.stock) || producto.stock < 0) {
      this.mostrarToast('El stock debe ser un número igual o mayor a 0', 'warning');
      return false;
    }

    if (!Array.isArray(producto.etiquetas) || producto.etiquetas.length === 0) {
      this.mostrarToast('Debes agregar al menos una etiqueta', 'warning');
      return false;
    }

    if (!Array.isArray(producto.imagen) || producto.imagen.length === 0) {
      this.mostrarToast('Debes subir al menos una imagen', 'warning');
      return false;
    }

    const estadosValidos = ['nuevo', 'segunda mano'];
    if (typeof producto.estado !== 'string' || !estadosValidos.includes(producto.estado.trim().toLowerCase())) {
      this.mostrarToast('El estado debe ser "nuevo" o "segunda mano"', 'warning');
      return false;
    }

    const dir = producto.direccionOrigen;
    if (
      !dir ||
      typeof dir.region !== 'string' || dir.region.trim() === '' ||
      typeof dir.comuna !== 'string' || dir.comuna.trim() === '' ||
      typeof dir.calle !== 'string' || dir.calle.trim() === '' ||
      typeof dir.numero !== 'number' || isNaN(dir.numero) || dir.numero <= 0
    ) {
      this.mostrarToast('Completa correctamente la dirección de origen', 'warning');
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

  eliminarImagen(index: number) {
    this.nuevoProductoEditadoForm.imagen.splice(index, 1);
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
}
