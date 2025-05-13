import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import imageCompression from 'browser-image-compression';
import { NgForm } from '@angular/forms';

// importar modelos
import { ProductoExtendidoPorProducto } from 'src/app/models/producto_ext.models';
import { Producto } from 'src/app/models/producto.models';
import { Oferta } from 'src/app/models/oferta.models';
import { Categoria } from 'src/app/models/categoria.models';

// importar servicios
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';
import { Timestamp } from '@angular/fire/firestore';

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
  ofertas: Oferta[] = [];
  etiquetas = [];

  // Variables para comportamientos
  mostrarModal = false;
  oferta = false;

  // Variables para formulario
  idUsuario: string = '';
  estados = ['nuevo', 'segunda mano'];
  nuevaEtiqueta = '';
  mostrarOferta: boolean = false;
  productoSeleccionado!: Producto;

  // modal AutoStock
  mostrarModalAutostock = false;
  productoParaAutostock: Producto | null = null;
  stockMinimo = 1;
  activarAutoStock = false;

  //Para crearlos individualmente
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
  };

  nuevaOfertaForm: {
    precio_oferta: number;
    fecha_inicio: string;
    fecha_fin: string;
  } = {
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
      const { id: productoId } = await this.guardarProducto(
        this.nuevoProductoForm
      );

      if (!productoId) {
        throw new Error('Error: El producto no se pudo guardar correctamente.');
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
      this.crudService.obtenerMisProductos().subscribe({
        next: (productos) => {
          this.productos = productos;
          console.log('Productos obtenidos:', this.productos);
        },
        error: (error) => {
          console.error('Error al obtener los productos:', error);
          this.mostrarToast('Error al cargar los productos', 'danger');
        },
      });
      await this.obtenerOfertas();
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      await this.mostrarToast('Error al cargar los productos', 'danger');
    }
  }

  // Guardar producto
  async guardarProducto(productoToCreate: Producto) {
    try {
      const esValido = await this.validarProducto(productoToCreate);
      if (!esValido) {
        return {};
      }
      const { id, producto } = await this.crudService.guardarProducto(
        productoToCreate
      );
      console.log('Producto guardado:', producto);
      this.resetearFormularioProducto();
      this.cerrarModal();
      this.mostrarToast('Producto guardado con éxito');
      return { id, producto };
    } catch (error: any) {
      console.error('Error al guardar el producto:', error);
      this.mostrarToast('Error al guardar el producto', 'danger');
    }
    return {};
  }

  async validarProducto(producto: Producto) {
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

  // Editar producto
  // async editarProducto(producto: Producto) {
  //   try {
  //     const productoEditado = await this.crudService.editarProducto(
  //       producto.id,
  //       producto
  //     );
  //     console.log('Producto editado:', productoEditado);
  //     this.mostrarToast('Producto editado con éxito');
  //   } catch (error) {
  //     console.error('Error al editar el producto:', error);
  //     this.mostrarToast('Error al editar el producto', 'danger');
  //   }
  // }

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
              this.productos = this.productos.filter(
                (p) => p.producto_id !== productoId
              );
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

  // ========================= Métodos de imagenes =========================
  async compressImage(file: File): Promise<File | null> {
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
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

  procesarImagenes(event: any) {
    const archivos = event.target.files;
    if (archivos && archivos.length > 0) {
      this.nuevoProductoForm.imagen = [];
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

  esArray(val: any): boolean {
    return Array.isArray(val);
  }

  // ========================= Métodos de ofertas =========================

  // Obtener ofertas del producto
  async obtenerOfertas() {
    try {
      await Promise.all(
        this.productos.map(async (producto) => {
          if (!producto.producto_id) return;

          const ofertas = await this.crudService.obtenerOfertaPorProducto(
            producto.producto_id
          );
          if (ofertas.length > 0) {
            producto.oferta = ofertas[0]; // Asignar la única oferta existente
          }
        })
      );
      console.log(
        'Ofertas asociadas a productos:',
        this.productos.map((p) => ({ titulo: p.titulo, oferta: p.oferta }))
      );
    } catch (error) {
      console.error('Error al obtener las ofertas:', error);
      this.mostrarToast('Error al cargar las ofertas', 'danger');
    }
  }

  async guardarOferta(form: NgForm) {
    if (!form.valid || !this.productoSeleccionado) {
      this.mostrarToast('Complete todos los campos', 'warning');
      return;
    }
    // Convertir ISO strings a Timestamps
    const inicioTs = Timestamp.fromDate(
      new Date(this.nuevaOfertaForm.fecha_inicio)
    );
    const finTs = Timestamp.fromDate(new Date(this.nuevaOfertaForm.fecha_fin));

    const ofertaParaGuardar: Oferta = {
      precio_oferta: this.nuevaOfertaForm.precio_oferta,
      fecha_inicio: inicioTs,
      fecha_fin: finTs,
      producto_id: this.productoSeleccionado.producto_id!,
    };

    if (!this.validarOferta(ofertaParaGuardar)) {
      return;
    }
    try {
      await this.crudService.guardarOferta(
        ofertaParaGuardar,
        this.productoSeleccionado
      );
      this.mostrarToast('Oferta guardada con éxito');
      this.cerrarModalOferta();
      form.resetForm();
    } catch (err) {
      console.error(err);
      this.mostrarToast('Error al guardar la oferta', 'danger');
    }
  }

  // Validar ofertas
  validarOferta(oferta: Oferta): boolean {
    if (oferta.precio_oferta <= 0) {
      this.mostrarToast('El precio de la oferta debe ser mayor a 0', 'warning');
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
      this.nuevaOfertaForm.fecha_inicio = Timestamp.fromDate(new Date())
        .toDate()
        .toISOString();
      this.nuevaOfertaForm.fecha_fin = Timestamp.fromDate(new Date())
        .toDate()
        .toISOString();
    }
  }

  // Modal
  abrirModal() {
    this.mostrarModal = true;
  }

  abrirModalOferta(producto: Producto) {
    this.productoSeleccionado = producto;

    // Fecha actual en local (incluye hora)
    const ahora = new Date();
    const tzOffset = ahora.getTimezoneOffset() * 60000; // offset en ms
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

  cerrarModal() {
    this.mostrarModal = false;
    this.resetearFormulario();
  }

  cerrarModalOferta() {
    this.mostrarOferta = false;
  }

  resetearFormulario() {
    this.oferta = false;
  }

  resetearFormularioProducto() {
    this.nuevoProductoForm = {
      usuario_id: '',
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

  // Abrir modal y precargar valores
  abrirModalAutostock(producto: Producto) {
    this.productoParaAutostock = producto;
    this.stockMinimo = producto.inventario_minimo || 1;
    this.activarAutoStock = !!producto.auto_stock;
    this.mostrarModalAutostock = true;
  }

  // Cerrar sin guardar
  cerrarModalAutostock() {
    this.mostrarModalAutostock = false;
    this.productoParaAutostock = null;
  }

  // Guardar cambios de AutoStock
  async guardarAutostock(form: NgForm) {
    if (form.invalid || !this.productoParaAutostock) {
      this.mostrarToast('Complete correctamente el formulario', 'warning');
      return;
    }

    const minimo = Number(this.stockMinimo);
    if (isNaN(minimo) || minimo < 1) {
      this.mostrarToast('El stock mínimo debe ser ≥ 1', 'warning');
      return;
    }

    // Actualizo modelo local
    this.productoParaAutostock.inventario_minimo = minimo;
    this.productoParaAutostock.auto_stock = this.activarAutoStock;

    try {
      await this.crudService.editarProducto(
        this.productoParaAutostock.producto_id!,
        {
          usuario_id: this.productoParaAutostock.usuario_id,
          inventario_minimo: minimo,
          auto_stock: this.activarAutoStock,
        } as Producto
      );
      this.mostrarToast('AutoStock configurado', 'success');
      this.cerrarModalAutostock();
      form.resetForm();
    } catch (err) {
      console.error('Error al guardar autostock:', err);
      this.mostrarToast('No se pudo configurar la alerta', 'danger');
    }
  }
}
