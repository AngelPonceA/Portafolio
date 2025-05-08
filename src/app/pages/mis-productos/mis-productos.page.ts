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

  //Para crearlos individualmente
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
    fecha_fin: new Date().toISOString()
  };

  // Para crearlos si son más de 1 
  variantesForms : Variante [] = [{
    atributo: '',
    estado: '',
    precio: 0,
    stock: 0,
    imagen: [],
    id: '',
    producto_id: '',
    sku: '',
    inventario_minimo: 0,
    auto_stock: false
  }] 

  ofertasForms : Oferta [] = [{
    id: '',
    variante_id: '',
    precio_oferta: 0,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: new Date().toISOString()
  }]

  varianteSeleccionada = 0;

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
      if (!this.validarProducto(this.nuevoProductoForm)) {
        console.log('Errores en el formulario del producto');
        this.mostrarToast('Hay errores en el formulario del producto', 'danger');
        return; 
      }

      const variantesInvalidas = this.variantesForms.filter(variante => !this.validarVarianteIndividual(variante));

      if (variantesInvalidas.length > 0) {
        console.log('Hay variantes inválidas:', variantesInvalidas);
        this.mostrarToast('Una o más variantes no son válidas', 'danger');
        return; 
      }

      const { id: productoId } = await this.guardarProducto(this.nuevoProductoForm);

      if (!productoId) {
        throw new Error('Error: El producto no se pudo guardar correctamente.');
      }

      const promisesVariantes = this.variantesForms.map(async (variante) => {
        const variantePorCrear = {
          ...variante,
          producto_id: productoId,
        };
        return this.guardarVariante(variantePorCrear, productoId);
      });

      const resultadosVariantes = await Promise.all(promisesVariantes);
      const variantesIds = resultadosVariantes.map(resultado => resultado?.id).filter(id => !!id);

      if (resultadosVariantes.length !== this.variantesForms.length || variantesIds.length === 0) {
        console.error('Error al guardar una o varias variantes.');
        this.mostrarToast('Error al guardar una o varias variantes', 'danger');
        return;
      }

      console.log('Producto y variantes guardados con éxito');
      this.mostrarToast('Producto y variantes guardados con éxito');
      window.location.reload();

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
  async guardarProducto(productoToCreate: Producto) {
    try {
      if (this.validarProducto(productoToCreate)) {
        const {id, producto} = await this.crudService.guardarProducto(
          productoToCreate
        );
        console.log('Producto guardado:', producto);
        this.mostrarToast('Producto guardado con éxito');
        return {id, producto};
      } else {
        this.mostrarToast('Error al guardar el producto', 'danger');
      }
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      this.mostrarToast('Error al guardar el producto', 'danger');
    }
    return {};
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

  async guardarVariante(varianteToCreate: Variante, productoId: string) {
    try {
      if (true || this.validarVarianteIndividual(varianteToCreate)) {
        const {id, variante} =  await this.crudService.guardarVariante(
          varianteToCreate, productoId
        );
        console.log('Variante guardada:', id, variante );
        this.mostrarToast('Variante guardado con éxito');
        return {id, variante};
      } else {
        this.mostrarToast('Error al guardar el variante', 'danger');
      }
    } catch (error) {
      console.error('Error al guardar el variante:', error);
      this.mostrarToast('Error al guardar el variante', 'danger');
    }
    return {};
  }

  // Validar variante individual
  validarVarianteIndividual(variante: Variante): boolean {
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
    return true;
  }


  // ==================== Métodos variables multiples ======================
  seleccionarVariante(index: number) {
    this.varianteSeleccionada = index;
  }

  addVariante() {
    this.variantesForms.push({
      id: '',
      atributo: '',
      estado: '',
      precio: 0,
      producto_id: '',
      sku: '',
      stock: 0,
      inventario_minimo: 0,
      auto_stock: false,
      imagen: []
    });
  }

  eliminarVariante(index: number) {
    if (this.variantesForms.length > 1) {
      this.variantesForms.splice(index, 1);
      // Ajustar el índice seleccionado
      if (this.varianteSeleccionada >= this.variantesForms.length) {
        this.varianteSeleccionada = this.variantesForms.length - 1;
      }
    }
  }

  actualizarNombreVariante(index: number, valor: string) {
    this.variantesForms[index].atributo = valor;
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

procesarImagenes(event: any, index: number) {
  const archivos = event.target.files;
  if (archivos && archivos.length > 0) {
    this.variantesForms[index].imagen = []; // Limpiar imágenes anteriores si se seleccionan nuevas
    for (const file of archivos) {
      this.compressAndReadImage(file, index);
    }
  }
}

async compressAndReadImage(file: File, index: number): Promise<void> {
  const compressedFile = await this.compressImage(file);
  if (compressedFile) {
    const reader = new FileReader();
    reader.onload = () => {
      this.variantesForms[index].imagen.push(reader.result as string);
    };
    reader.readAsDataURL(compressedFile);
  }
}

esArray(val: any): boolean {
  return Array.isArray(val);
}

  // ========================= Métodos de ofertas =========================

  // Obtener ofertas del producto
  async obtenerOfertas(productoId: string) {
    try {
      const ofertasPorVariante = await Promise.all(
        this.variantes.map((variante) =>
          this.crudService.obtenerOfertaPorVariante(variante.id)
        )
      );
      this.ofertas = ofertasPorVariante.flat();
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

  async guardarOferta(ofertaForm: any, variante_id: string) {
    try {
      // Convertir las fechas string del formulario a objetos Timestamp
      const ofertaParaGuardar = {
        ...ofertaForm,
        fecha_inicio: ofertaForm.fecha_inicio ? (ofertaForm.fecha_inicio instanceof Date ? Timestamp.fromDate(ofertaForm.fecha_inicio) : Timestamp.fromDate(new Date(ofertaForm.fecha_inicio))) : null,
        fecha_fin: ofertaForm.fecha_fin ? (ofertaForm.fecha_fin instanceof Date ? Timestamp.fromDate(ofertaForm.fecha_fin) : Timestamp.fromDate(new Date(ofertaForm.fecha_fin))) : null,
      };
  
      if (true || this.validarOfertas([ofertaParaGuardar])) {
        const ofertaGuardada = await this.crudService.guardarOferta(ofertaParaGuardar, variante_id);
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
      this.nuevaOfertaForm.fecha_inicio = Timestamp.fromDate(new Date());
      this.nuevaOfertaForm.fecha_fin = Timestamp.fromDate(new Date());
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

  // autoStock
  async activarAutostock(
    productoExtendidoPorProducto: ProductoExtendidoPorProducto
  ) {
    console.log('activar autostock: ', productoExtendidoPorProducto);
    const promises = productoExtendidoPorProducto.variantes.map(
      async (variante) => {
        const alert = await this.alertController.create({
          header: 'Configurar Alerta de Stock',
          subHeader: `Stock actual: ${variante?.stock ?? 'N/A'}`,
          inputs: [
            {
              name: 'minStock',
              type: 'number',
              placeholder: 'Stock mínimo deseado',
              min: '1',
              value: '5',
            },
          ],
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Guardar',
              handler: (data) => {
                const minStock = Number(data.minStock);
                this.mostrarToast(
                  variante.stock <= minStock
                    ? `¡ALERTA! Stock bajo (${variante.stock} unidades)`
                    : `Stock suficiente (${variante.stock} unidades)`,
                  variante.stock <= minStock ? 'warning' : 'success'
                );
              },
            },
          ],
        });
        await alert.present();
      }
    );
    await Promise.all(promises);
  }
}
