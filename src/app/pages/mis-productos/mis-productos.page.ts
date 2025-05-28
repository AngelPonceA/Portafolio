import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastController, AlertController, ModalController } from '@ionic/angular'; // Importa ModalController
import { NgForm } from '@angular/forms';

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
import { ModalOfertaComponent } from 'src/app/components/mis-productos/modal-oferta/modal-oferta.component';
import { ModalAlertaStockComponent } from 'src/app/components/mis-productos/modal-alerta-stock/modal-alerta-stock.component';

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

    // Método para obtener ofertas 
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

  // Nuevo método para abrir el modal de editar producto
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

  // Nuevo método para abrir el modal de agregar oferta a producto
 async abrirModalOferta(producto: Producto){
    const modal = await this.modalController.create({
      component: ModalOfertaComponent,
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

  // Nuevo método para abrir el modal de alerta stock
  async abrirModalAlertaStock(producto: Producto) {
    const modal = await this.modalController.create({
      component: ModalAlertaStockComponent,
      componentProps: {
        productoParaAutostock: producto, // Pasa el producto para autostock
      },
    });

    modal.onDidDismiss().then((resultado) => {
      if (resultado.data?.actualizado) {
        this.mostrarToast('AutoStock configurado correctamente', 'success');
        this.ionViewWillEnter();
      }
    });

    await modal.present();
  }

}