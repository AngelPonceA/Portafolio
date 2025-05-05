import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import imageCompression from 'browser-image-compression';

// importar modelos
import { ProductoExtendidoPorProducto } from 'src/app/models/producto_ext.models';
import { Producto } from 'src/app/models/producto.models';
import { Variante } from 'src/app/models/variante.models';
import { Oferta } from 'src/app/models/oferta.models';
import { Categoria } from 'src/app/models/categoria.models';

// importar servicios
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
  standalone: false,
})
export class MisProductosPage implements OnInit {
  // Variables
  //Inicializar Variables relacionadas a modelos
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  variantes: Variante[] = [];
  ofertas: Oferta[] = [];
  productosExtendidosPorProducto: ProductoExtendidoPorProducto[] = [];
  etiquetas = [];

  // Variables para comportamientos
  mostrarModal = false;
  oferta = false;

  // Variables para formulario
  idUsuario: string = '';
  estados = ['nuevo', 'segunda mano'];
  nuevaEtiqueta = '';
  cantidadVariantes = 0;
  mostrarOferta: boolean = false;

  nuevoProductoForm: Producto = {
    id: '',
    usuario_id: '',
    categoria: '',
    titulo: '',
    descripcion: '',
    etiquetas: [],
  };

  nuevaVarianteForm: Variante = {
    id: '',
    oferta_id: '',
    atributo: '',
    estado: '',
    precio: 0,
    producto_id: '',
    sku: '',
    stock: 0,
    inventario_minimo: 0,
    auto_stock: false,
    imagen: [],
  };

  nuevaOfertaForm: Oferta = {
    id: '',
    variante_id: '',
    precio_oferta: 0,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: new Date().toISOString(),
  };

  //Constructor de la pagina
  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private crudService: CrudService
  ) {}

  // Obtener el id de la sesion
  async ngOnInit() {
    const { id } = await this.authService.obtenerSesion();
    if (!id) throw new Error('El usuario no ha iniciado sesion');
    this.idUsuario = id;
    console.debug('Sesión existente:', this.idUsuario);
  }

  async enviarFormularios() {
    try {
      // Verifica si todos los formularios son válidos antes de enviarlos
      if (
        true ||
        (this.validarProducto(this.nuevoProductoForm) &&
          this.validarVariantes([this.nuevaVarianteForm]) &&
          this.validarOfertas([this.nuevaOfertaForm]))
      ) {
        const producto = await this.guardarProducto(this.nuevoProductoForm);
        const variantePorCrear = {
          ...this.nuevaVarianteForm,
          producto_id: producto?.id ?? 'uuid',
        };
        const variante = await this.guardarVariante(variantePorCrear);
        const ofertaPorCrear = {
          ...this.nuevaOfertaForm,
          variante_id: variante?.id ?? 'uuid',
        };
        await this.guardarOferta(ofertaPorCrear);
        console.log('Todos los formularios se enviaron con éxito');
        this.mostrarToast('Todos los formularios se enviaron con éxito');
      } else {
        console.log('Hay errores en los formularios');
        this.mostrarToast('Hay errores en los formularios', 'danger');
      }
    } catch (error) {
      console.error('Error al enviar los formularios:', error);
      this.mostrarToast('Error al enviar los formularios', 'danger');
    }
  }

  // ========================= Métodos de productos =========================

  // Obtener los productos del usuario
  async ionViewWillEnter() {
    try {
      this.obtenerCategorias();
      this.crudService.obtenerProductoExtendidoDeUsuario().subscribe({
        next: (pe) => {
          this.productosExtendidosPorProducto = pe;
          console.log('pe', pe);
        },
        error: (error) => {
          console.error('Error al obtener los productos:', error);
          this.mostrarToast('Error al cargar los productos', 'danger');
        },
      });
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      await this.mostrarToast('Error al cargar los productos', 'danger');
    }
  }

  // Guardar producto
  async guardarProducto(producto: Producto) {
    try {
      if (this.validarProducto(producto)) {
        const productoGuardado = await this.crudService.guardarProducto(
          producto
        );
        console.log('Producto guardado:', productoGuardado);
        this.mostrarToast('Producto guardado con éxito');
        return productoGuardado;
      } else {
        this.mostrarToast('Error al guardar el producto', 'danger');
      }
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      this.mostrarToast('Error al guardar el producto', 'danger');
    }
    return null;
  }

  // Validar producto
  validarProducto(producto: Producto): boolean {
    if (!producto.titulo.trim() || producto.titulo.length < 3) {
      this.mostrarToast(
        'El título debe tener al menos 3 caracteres',
        'warning'
      );
      return false;
    }
    if (producto.descripcion.length > 5000) {
      this.mostrarToast(
        'El largo de la descripción debe ser menor que 5000',
        'warning'
      );
      return false;
    }
    if (producto.etiquetas.length < 1) {
      this.mostrarToast('Debes seleccionar al menos una etiqueta', 'warning');
      return false;
    }
    return true;
  }

  // Editar producto
  async editarProducto(producto: Producto) {
    try {
      const productoEditado = await this.crudService.editarProducto(
        producto.id,
        producto
      );
      console.log('Producto editado:', productoEditado);
      this.mostrarToast('Producto editado con éxito');
    } catch (error) {
      console.error('Error al editar el producto:', error);
      this.mostrarToast('Error al editar el producto', 'danger');
    }
  }

  // Eliminar producto
  async eliminarProducto(productoId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este producto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.crudService.eliminarProducto(productoId);
              const variantesEliminadas =
                await this.crudService.eliminarVariantesPorProducto(productoId);
              variantesEliminadas.forEach(async (variante) => {
                await this.crudService.eliminarOfertasPorVariante(variante.id);
              });
              console.log('Producto eliminado:', productoId);
              this.mostrarToast('Producto eliminado con éxito');
            } catch (error) {
              console.error('Error al eliminar el producto:', error);
              this.mostrarToast('Error al eliminar el producto', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ========================= Métodos para etiquetas =========================

  agregarEtiqueta() {
    console.log('nuevaEtiqueta', this.nuevaEtiqueta);
    if (
      this.nuevaEtiqueta.trim() !== '' &&
      !this.nuevoProductoForm.etiquetas.includes(this.nuevaEtiqueta.trim())
    ) {
      this.nuevoProductoForm.etiquetas.push(this.nuevaEtiqueta.trim());

      this.nuevaEtiqueta = '';
    }
  }

  eliminarEtiqueta(etiqueta: string) {
    this.nuevoProductoForm.etiquetas = this.nuevoProductoForm.etiquetas.filter(
      (e) => e !== etiqueta
    );
  }

  // ========================= Métodos de variantes =========================

  // Obtener variantes del producto
  async obtenerVariantes(productoId: string) {
    try {
      console.log('Obteniendo variantes por productos');
      this.crudService.obtenerVariantesPorProducto(productoId).subscribe({
        next: (v) => {
          this.variantes = [...this.variantes, ...v];
          console.log('Variantes obtenidas:', this.variantes);
        },
        error: (error) => {
          console.error('Error al obtener las variantes:', error);
          this.mostrarToast('Error al cargar las variantes', 'danger');
        },
      });
      console.log('Variantes obtenidas:', this.variantes);
    } catch (error) {
      console.error('Error al obtener las variantes:', error);
      this.mostrarToast('Error al cargar las variantes', 'danger');
    }
  }

  obtenerVariantesPorProducto(productoId: string): Variante[] {
    return this.variantes.filter((v) => v.producto_id === productoId);
  }

  // Guardar variantes
  guardarVariantes(variantes: Variante[]) {
    try {
      this.variantes = variantes;
      console.log('Variantes guardadas:', this.variantes);
      this.mostrarToast('Variantes guardadas con éxito');
    } catch (error) {
      console.error('Error al guardar las variantes:', error);
      this.mostrarToast('Error al guardar las variantes', 'danger');
    }
  }

  async guardarVariante(variante: Variante) {
    try {
      if (true || this.validarVariantes([variante])) {
        const varianteGuardada = await this.crudService.guardarVariante(
          variante
        );
        console.log('Variante guardada:', varianteGuardada);
        this.mostrarToast('Variante guardado con éxito');
        return varianteGuardada;
      } else {
        this.mostrarToast('Error al guardar el variante', 'danger');
      }
    } catch (error) {
      console.error('Error al guardar el variante:', error);
      this.mostrarToast('Error al guardar el variante', 'danger');
    }
    return null;
  }

  // Validar variantes
  validarVariantes(variantes: Variante[]): boolean {
    for (const variante of variantes) {
      if (!variante.atributo.trim() || variante.atributo.length < 3) {
        this.mostrarToast(
          'El atributo de la variante debe tener al menos 3 caracteres',
          'warning'
        );
        console.warn('El atributo de la variante no es válido');
        return false;
      }
      if (variante.precio <= 0) {
        this.mostrarToast(
          'El precio de la variante debe ser mayor a 0',
          'warning'
        );
        console.warn('El precio de la variante no es válido');
        return false;
      }
      if (variante.stock < 0) {
        this.mostrarToast(
          'El stock de la variante no puede ser negativo',
          'warning'
        );
        return false;
      }
      if (variante.auto_stock === true && variante.inventario_minimo <= 0) {
        this.mostrarToast('El inventario mínimo debe ser mayor a 0', 'warning');
        return false;
      }
      if (false || variante.imagen === null) {
        this.mostrarToast(
          'La imagen de la variante no puede ser nula',
          'warning'
        );
        return false;
      }
      if (false || variante.imagen.length < 1) {
        this.mostrarToast(
          'La imagen de la variante no puede estar vacía',
          'warning'
        );
        return false;
      }
    }
    return true;
  }

  // Eliminar variante
  async eliminarVariante(varianteId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta variante?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.crudService.eliminarVariante(varianteId);
              console.log('Variante eliminada:', varianteId);
              this.mostrarToast('Variante eliminada con éxito');
            } catch (error) {
              console.error('Error al eliminar la variante:', error);
              this.mostrarToast('Error al eliminar la variante', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ========================= Métodos de imagenes =========================
  async compressImage(file: File): Promise<File | null> {
    const options = {
      maxSizeMB: 0.3, // Tamaño máximo en MB (ajusta según necesites)
      maxWidthOrHeight: 1024, // Ancho o alto máximo (opcional)
      useWebWorker: true, // Recomendado para no bloquear el hilo principal
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

  async procesarImagenes(event: any): Promise<void> {
    const archivos = event.target.files;
    if (!archivos || archivos.length === 0) {
      return;
    }

    this.nuevaVarianteForm.imagen = [];

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      const compressedFile = await this.compressImage(archivo);
      if (compressedFile) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          this.nuevaVarianteForm.imagen.push(base64String); // Convertimos el archivo a base64 y lo guardamos
        };
        reader.readAsDataURL(compressedFile);
      }
    }
  }

  esArray(val: any): boolean {
    return Array.isArray(val);
  }

  // ========================= Métodos de ofertas =========================

  // Obtener ofertas del producto
  async obtenerOfertas(productoId: string) {
    try {
      try {
        const ofertas = await Promise.all(
          this.variantes.map((variante) =>
            this.crudService.obtenerOfertaPorVariante(variante.id)
          )
        );
        this.ofertas = ofertas.flat();
        console.log('Ofertas obtenidas:', this.ofertas);
      } catch (error) {
        console.error('Error al obtener las ofertas:', error);
        this.mostrarToast('Error al cargar las ofertas', 'danger');
      }
      console.log('Ofertas obtenidas:', this.ofertas);
    } catch (error) {
      console.error('Error al obtener las ofertas:', error);
      this.mostrarToast('Error al cargar las ofertas', 'danger');
    }
  }

  // Guardar ofertas
  guardarOfertas(ofertas: Oferta[]) {
    try {
      this.ofertas = ofertas;
      console.log('Oferta guardada:', this.ofertas);
      this.mostrarToast('Oferta guardada con éxito');
    } catch (error) {
      console.error('Error al guardar la oferta:', error);
      this.mostrarToast('Error al guardar la oferta', 'danger');
    }
  }

  async guardarOferta(oferta: Oferta) {
    try {
      if (true || this.validarOfertas([oferta])) {
        const ofertaGuardada = await this.crudService.guardarOferta(oferta);
        console.log('Oferta guardada:', ofertaGuardada);
        this.mostrarToast('Oferta guardado con éxito');
        return ofertaGuardada;
      } else {
        this.mostrarToast('Error al guardar la oferta', 'danger');
      }
    } catch (error) {
      console.error('Error al guardar la oferta:', error);
      this.mostrarToast('Error al guardar la oferta', 'danger');
    }
    return null;
  }

  // Validar ofertas
  validarOfertas(ofertas: Oferta[]): boolean {
    for (const oferta of ofertas) {
      if (oferta.precio_oferta <= 0) {
        this.mostrarToast(
          'El precio de la oferta debe ser mayor a 0',
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
    }
    return true;
  }

  eliminarOferta(ofertaId: string) {
    const alert = this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta oferta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.crudService.eliminarOferta(ofertaId);
              console.log('Oferta eliminada:', ofertaId);
              this.mostrarToast('Oferta eliminada con éxito');
            } catch (error) {
              console.error('Error al eliminar la oferta:', error);
              this.mostrarToast('Error al eliminar la oferta', 'danger');
            }
          },
        },
      ],
    });
    alert.then((alert) => alert.present());
  }

  // ========================= Métodos de categorias =========================

  // Obtener categorias
  async obtenerCategorias() {
    try {
      this.crudService.obtenerCategorias().subscribe({
        next: (categorias) => {
          this.categorias = categorias;
          console.log('Categorías obtenidas:', this.categorias);
        },
        error: (error) => {
          console.error('Error al obtener las categorías:', error);
          this.mostrarToast('Error al cargar las categorías', 'danger');
        },
      });
      console.log('Categorías obtenidas:', this.categorias);
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
      this.mostrarToast('Error al cargar las categorías', 'danger');
    }
  }

  //Obtener nombre categoria
  obtenerNombreCategoriaPorId(id: string) {
    return this.categorias.find((c) => c.id === id)?.nombre;
  }

  // Guardar categorias
  guardarCategorias(categorias: Categoria[]) {
    try {
      this.categorias = categorias;
      console.log('Categorías guardadas:', this.categorias);
      this.mostrarToast('Categorías guardadas con éxito');
    } catch (error) {
      console.error('Error al guardar las categorías:', error);
      this.mostrarToast('Error al guardar las categorías', 'danger');
    }
  }

  // Validar categorias
  validarCategorias(categorias: Categoria[]): boolean {
    for (const categoria of categorias) {
      if (categoria === null) {
        this.mostrarToast('La categoría no puede ser nula', 'warning');
        return false;
      }
    }
    return true;
  }

  // ========================= Métodos de comportamiento =========================
  // Mostrar toast
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

  onOfertaToggle() {
    if (!this.mostrarOferta) {
      this.nuevaOfertaForm.precio_oferta = 0;
      this.nuevaOfertaForm.fecha_inicio = new Date();
      this.nuevaOfertaForm.fecha_fin = new Date();
    }
  }

  // Modal
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.oferta = false;
  }
}
