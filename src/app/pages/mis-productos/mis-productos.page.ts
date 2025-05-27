import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastController, AlertController, ModalController } from '@ionic/angular'; // Importa ModalController
import imageCompression from 'browser-image-compression'; // Solo si lo usas en otros lugares de esta página
import { NgForm } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';

// importar modelos
import { Producto } from 'src/app/models/producto.models';
import { Oferta } from 'src/app/models/oferta.models';
import { Categoria } from 'src/app/models/categoria.models';

// importar servicios
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';

// Importa tu nuevo componente modal
import { ModalAgregarProductoComponent } from 'src/app/components/mis-productos/modal-agregar-producto/modal-agregar-producto.component';
import { ModalEditarProductoComponent } from 'src/app/components/mis-productos/modal-editar-producto/modal-editar-producto.component';

@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
  standalone: false,
})
export class MisProductosPage implements OnInit {
  categorias: Categoria[] = [];
  productos: Producto[] = [];
  ofertas: Oferta[] = [];
  estados = ['nuevo', 'segunda mano'];
  oferta = false;
  idUsuario: string = 'LtOy7x75rVTK4f56xhErfdDPEs92'; 

  mostrarOferta: boolean = false;
  productoSeleccionado!: Producto;

  nuevaOfertaForm: {
    precio_oferta: number;
    fecha_inicio: string;
    fecha_fin: string;
  } = {
    precio_oferta: 0,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: new Date().toISOString(),
  };

  mostrarModalAutostock = false;
  productoParaAutostock: Producto | null = null;
  stockMinimo = 1;
  activarAutoStock = false;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private crudService: CrudService,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController 
  ) {}

  async ngOnInit() {
    // const { id } = await this.authService.obtenerSesion();
    // if (!id) throw new Error('El usuario no ha iniciado sesion');
    // this.idUsuario = id;
    // console.debug('Sesión existente:', this.idUsuario);
  }

  async ionViewWillEnter() {
    try {
      this.obtenerCategorias();
      this.crudService.obtenerMisProductos().subscribe({
        next: async (productos) => {
          this.productos = productos;
          await this.obtenerOfertas(); 
          this.cdr.detectChanges(); 
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

  // --- Métodos de ofertas (se quedan aquí) ---
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
          } else {
            producto.oferta = undefined; 
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
            handler: () => {},
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
              await this.obtenerOfertas(); // Recargar ofertas después de eliminar
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

  obtenerNombreCategoriaPorId(id: string) {
    return this.categorias.find((c) => c.id === id)?.nombre;
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

  // Nuevo método para abrir el modal de agregar producto
  async abrirModalAgregarProducto() {
    const modal = await this.modalController.create({
      component: ModalAgregarProductoComponent,
      componentProps: {
        userId: this.idUsuario, 
      },
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data && result.data.productSaved) {
        await this.ionViewWillEnter();
        this.mostrarToast('Producto agregado exitosamente y lista actualizada.', 'success');
      }
    });

    await modal.present();
    
  }

  async abrirModalEditarProducto(producto: Producto) {
    const modal = await this.modalController.create({
      component: ModalEditarProductoComponent,
      componentProps: {
        initialProductData: producto, // Pasa el producto a editar
        userId: this.idUsuario, // Pasa el ID del usuario
      },
    });
    modal.onDidDismiss().then((resultado) => {
        if (resultado.data?.actualizado) {
          this.mostrarToast('Producto actualizado correctamente', 'success');
          this.ionViewWillEnter();
        }
      });
    await modal.present();
  }

  abrirModalOferta(producto: Producto) {
    this.productoSeleccionado = producto;

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

  cerrarModalOferta() {
    this.mostrarOferta = false;
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