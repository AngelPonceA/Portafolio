import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import imageCompression from 'browser-image-compression';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

// importar modelos
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

  mostrarModalEdicion = false;
  productoEnEdicion: Producto | null = null;
  productoEditandoForm: any = {};
  nuevaEtiquetaEdit: string = '';

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
    private crudService: CrudService,
    private cdr: ChangeDetectorRef
  ) {}

  // Obtener el id de la sesion
  async ngOnInit() {
    // const { id } = await this.authService.obtenerSesion();
    // if (!id) throw new Error('El usuario no ha iniciado sesion');
    // this.idUsuario = id;
    // console.debug('Sesión existente:', this.idUsuario);
  }

  async enviarFormularios() {
    try {
      if (this.productoEnEdicion) {
        await this.editarProducto(this.nuevoProductoForm);
      } else {
        const { id: productoId } = await this.guardarProducto(
          this.nuevoProductoForm
        );
        if (!productoId) throw new Error('No se pudo guardar el producto');
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
        next: async (productos) => {
          this.productos = productos;

          await this.obtenerOfertas(); // Esperar después de cargar productos
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

  async editarProducto(productoEditado: Producto) {
    try {
      if (!productoEditado.producto_id) {
        this.mostrarToast('Producto sin ID válido', 'danger');
        return;
      }

      const esValido = await this.validarProducto(productoEditado);
      if (!esValido) {
        return;
      }

      await this.crudService.editarProducto(
        productoEditado.producto_id,
        productoEditado
      );
      this.mostrarToast('Producto editado con éxito');
      this.cerrarModal();
      this.resetearFormularioProducto();
      await this.ionViewWillEnter();
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
            (document.activeElement as HTMLElement)?.blur();

            try {
              await this.crudService.eliminarProducto(productoId);
              this.productos = this.productos.filter(
                (p) => p.producto_id !== productoId
              );
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
      return compressedFile;
    } catch (error) {
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
            producto.oferta = ofertas[0];
          }
        })
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

    const productoId = this.productoSeleccionado.producto_id;
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

    const esValida = this.validarOferta(nuevaOferta, this.productoSeleccionado);
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
            handler: () => {
            },
          },
          {
            text: 'Reemplazar',
            handler: async () => {
              const ofertaAnterior = ofertasExistentes[0];

              if (ofertaAnterior?.id) {
                await this.crudService.eliminarOferta(ofertaAnterior.id);
                await this.crearNuevaOferta(this.productoSeleccionado);
                this.mostrarToast(
                  'Oferta reemplazada correctamente',
                  'success'
                );
                this.obtenerOfertas();
              } else {
                console.error('Error: ID de la oferta anterior no definido.');
                this.mostrarToast('Error al reemplazar la oferta', 'danger');
              }
            },
          },
        ],
      });
      await alerta.present();
    } else {
      await this.crearNuevaOferta(this.productoSeleccionado);
      this.mostrarToast('Oferta creada correctamente', 'success');
      this.obtenerOfertas();
    }
  }

  async crearNuevaOferta(productoSeleccionado: Producto) {
    try {
      const nuevaOferta: Oferta = {
        producto_id: productoSeleccionado.producto_id,
        precio_oferta: this.nuevaOfertaForm.precio_oferta,
        fecha_inicio: Timestamp.fromDate(
          new Date(this.nuevaOfertaForm.fecha_inicio)
        ),
        fecha_fin: Timestamp.fromDate(new Date(this.nuevaOfertaForm.fecha_fin)),
      };

      const oferta = await this.crudService.guardarOferta(
        nuevaOferta,
        productoSeleccionado
      );

      this.mostrarToast('Oferta guardada con éxito');

      await this.obtenerOfertas();
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

  async eliminarOferta(ofertaId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar esta oferta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            (document.activeElement as HTMLElement)?.blur();

            try {
              await this.crudService.eliminarOferta(ofertaId);
              if (this.productoSeleccionado) {
                this.productoSeleccionado.oferta = undefined;
              }
              this.mostrarToast('Oferta eliminada con éxito');
            } catch (error) {
              console.error('Error al eliminar la oferta:', error);
              this.mostrarToast('Error al eliminar la oferta', 'danger');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ========================= Métodos de categorias =========================

  // Obtener categorias
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
  // ========================= Métodos de editarProducto =========================
  guardarCambiosProducto(form: any) {
    const error = this.validarEdicion(form);

    if (error) {
      return;
    }

    const id = form.producto_id;
    this.crudService.editarProducto(id, form).then(() => {
      this.cerrarModalEdicion();
      this.ionViewWillEnter(); // Refresca lista
    });
  }

  eliminarEtiquetaEdicion(etiqueta: string) {
    this.productoEditandoForm.etiquetas =
      this.productoEditandoForm.etiquetas.filter((e: string) => e !== etiqueta);
  }

  agregarEtiquetaEdicion() {
    const nueva = this.nuevaEtiquetaEdit?.trim();
    if (
      nueva &&
      !this.productoEditandoForm.etiquetas.includes(nueva) &&
      this.productoEditandoForm.etiquetas.length < 10
    ) {
      this.productoEditandoForm.etiquetas.push(nueva);
    }
    this.nuevaEtiquetaEdit = '';
  }

  procesarImagenesEdicion(event: any) {
    const archivos: FileList = event.target.files;
    for (let i = 0; i < archivos.length; i++) {
      const lector = new FileReader();
      lector.onload = (e: any) => {
        this.productoEditandoForm.imagen.push(e.target.result);
      };
      lector.readAsDataURL(archivos[i]);
    }
  }

  validarEdicion(productoEditandoForm: Partial<Producto>): string | null {
    if (
      !productoEditandoForm.titulo ||
      productoEditandoForm.titulo.trim() === ''
    ) {
      this.mostrarToast('El título no puede estar vacío', 'warning');
      return 'El título no puede estar vacío';
    }
    if (
      !productoEditandoForm.descripcion ||
      productoEditandoForm.descripcion.trim() === ''
    ) {
      this.mostrarToast('La descripción no puede estar vacía', 'warning');
      return 'La descripción no puede estar vacía';
    }
    if (
      !productoEditandoForm.categoria ||
      productoEditandoForm.categoria.trim() === ''
    ) {
      this.mostrarToast('La categoría no puede estar vacía', 'warning');
      return 'La categoría no puede estar vacía';
    }
    if (
      productoEditandoForm.precio === undefined ||
      productoEditandoForm.precio <= 0
    ) {
      this.mostrarToast('El precio debe ser mayor a 0', 'warning');
      return 'El precio debe ser mayor a 0';
    }
    if (
      productoEditandoForm.stock === undefined ||
      productoEditandoForm.stock < 0
    ) {
      this.mostrarToast('El stock no puede ser negativo', 'warning');
      return 'El stock no puede ser negativo';
    }
    if (
      !productoEditandoForm.etiquetas ||
      productoEditandoForm.etiquetas.length === 0
    ) {
      this.mostrarToast(
        'El producto debe tener al menos una etiqueta',
        'warning'
      );
      return 'El producto debe tener al menos una etiqueta';
    }
    if (
      !productoEditandoForm.imagen ||
      productoEditandoForm.imagen.length === 0
    ) {
      this.mostrarToast(
        'El producto debe tener al menos una imagen',
        'warning'
      );
      return 'El producto debe tener al menos una imagen';
    }
    if (
      !productoEditandoForm.estado ||
      productoEditandoForm.estado.trim() === ''
    ) {
      this.mostrarToast('El estado no puede estar vacío', 'warning');
      return 'El estado no puede estar vacío';
    }
    return null;
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

  abrirModalEditar(producto: any) {
    this.productoEditandoForm = { ...producto }; // Copia profunda si es necesario
    this.mostrarModalEdicion = true;
  }

  cerrarModalEdicion() {
    this.mostrarModalEdicion = false;
    this.productoEditandoForm = {};
  }

  // Modal para crear oferta
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

  cerrarModalOferta() {
    this.mostrarOferta = false;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.resetearFormulario();
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
