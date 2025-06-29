import { Component, Output, EventEmitter, Input } from '@angular/core';
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
import { UbicacionService } from 'src/app/services/ubicacion/ubicacion.service';
@Component({
  selector: 'app-modal-agregar-producto',
  templateUrl: './modal-agregar-producto.component.html',
  styleUrls: ['./modal-agregar-producto.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
})
export class ModalAgregarProductoComponent{

  @Input() initialProductData?: Producto; 
  @Input() userId: string = ''; 

  // Salidas para notificar al componente padre sobre acciones
  @Output() productSaved = new EventEmitter<Producto>();
  @Output() modalClosed = new EventEmitter<void>();

  // Variables para formulario
  nuevoProductoForm: Producto = {
    usuario_id: '',
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
      descripcion: ''
    }
    
  };

  regiones: any[] = [];
  comunas: string[] = [];
  estados = ['nuevo', 'segunda mano'];
  nuevaEtiqueta = '';
  categorias: Categoria[] = [];

  constructor(
    private toastController: ToastController,
    private alertController: AlertController, 
    private crudService: CrudService,
    private modalController: ModalController, 
    private authService: AuthService,
    private ubicacionService: UbicacionService
  ) {}

  async ngOnInit() {
    this.obtenerCategorias();
    this.regiones = this.ubicacionService.getRegiones();
  }

  onRegionChange(event: any) {
  const regionId = event.detail.value;
  const region = this.regiones.find(r => r.id === regionId);
  this.comunas = region ? region.comunas : [];
  this.nuevoProductoForm.direccionOrigen.comuna = '';
}

  // Lógica para guardar el producto
  async guardarProducto() {
    try {
      this.nuevoProductoForm.usuario_id = this.userId;

      const esValido = await this.validarProducto(this.nuevoProductoForm);
      if (!esValido) {
        return;
      }

      const { id, producto } = await this.crudService.guardarProducto(this.nuevoProductoForm);
      if (!id) {
        throw new Error('No se pudo guardar el producto');
      }

      this.mostrarToast('Producto guardado con éxito');
      this.productSaved.emit(producto); // Emitir el producto guardado al padre
      this.cerrarModal();
      this.resetearFormularioProducto(); // Resetear el formulario para futuras aperturas
    } catch (error: any) {
      console.error('Error al guardar el producto:', error);
      this.mostrarToast('Error al guardar el producto', 'danger');
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


  // Métodos para etiquetas
  agregarEtiqueta() {
    if (this.nuevaEtiqueta.trim() !== '' && !this.nuevoProductoForm.etiquetas.includes(this.nuevaEtiqueta.trim())) {
      this.nuevoProductoForm.etiquetas.push(this.nuevaEtiqueta.trim());
      this.nuevaEtiqueta = '';
    }
  }

  eliminarEtiqueta(etiqueta: string) {
    this.nuevoProductoForm.etiquetas = this.nuevoProductoForm.etiquetas.filter((e) => e !== etiqueta);
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
      this.nuevoProductoForm.imagen = []; // Limpiar imagenes
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
        this.nuevoProductoForm.imagen.push(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    }
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

  // Métodos de comportamiento
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

  async cerrarModal() {
    await this.modalController.dismiss();
    this.modalClosed.emit();
  }

  resetearFormularioProducto() {
    this.nuevoProductoForm = {
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
      direccionOrigen: 
      {
        region: '',
        comuna: '',
        calle: '',
        numero: 0,
        departamento: '',
        descripcion: ''
      }
    };
    this.nuevaEtiqueta = '';
  }
}