import { Usuario } from './../../models/usuario.models';
import { reload } from '@angular/fire/auth';
import { Producto } from './../../models/producto.models';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { CrudService } from 'src/app/services/crud/crud.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { ModalController } from '@ionic/angular';
import { ModalEditarProductoComponent } from 'src/app/components/mis-productos/modal-editar-producto/modal-editar-producto.component';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: false
})

export class ProductoPage implements OnInit {

  usuario?: any;
  tienda? : any;
  producto: any;
  miCalificacion?: number;
  comprado? : boolean;
  favoritos: any[] = [];
  esFavorito?: any;
  cantidadOpciones: number[] = [];
  opcionStock: number = 1;
  usuarioEsAdmin: boolean = false;

  constructor(private router: Router, 
              private crudService: CrudService, 
              private authService: AuthService, 
              private cartService: CarritoService, 
              private ionicService: IonicService,
              private modalCtrl: ModalController
            ) {}
    
  async ngOnInit() {
    const producto_id = this.router.getCurrentNavigation()?.extras?.state?.['producto_id'];

    if (!producto_id) return;

    await this.ionicService.mostrarCargando('Cargando producto...');

    try {
      this.usuario = await this.authService.obtenerPerfil();

      if (this.usuario?.rol === 'admin') {
        this.usuarioEsAdmin = true;
      }

      if (this.usuario) {
        this.miCalificacion = await this.crudService.obtenerMiCalificacionProducto(producto_id);
        if (!this.miCalificacion) {
          this.comprado = await this.crudService.esComprado(producto_id);
        }
      }

      this.producto = await this.crudService.obtenerDetalleProducto(producto_id);

      if (this.producto) {
        this.cantidadOpciones = Array.from({ length: this.producto.stock }, (_, i) => i + 1);

        this.tienda = await this.authService.obtenerDetallesTienda(this.producto.vendedor_id);
        this.tienda.calificacion = await this.crudService.obtenerPromedioCalificacionTienda(this.producto.vendedor_id);
      }

      this.esFavorito = await this.crudService.esFavorito(producto_id);
    } catch (error) {
      console.error('Error al cargar producto:', error);
    } finally {
      await this.ionicService.ocultarCargando();
    }
  }

  calcularTotal(){
    this.producto.cantidad = this.opcionStock;
    let total = ( this.producto.precio_oferta || this.producto.precio ) * this.producto.cantidad;
    return total;
  }

  mensajeWhatsApp(){
    this.authService.obtenerNumeroVendedor(this.producto.vendedor_id).then(telefono => {
      const url = `https://wa.me/${telefono}?text=Hola, tengo interés en su producto`;
      window.open(url, '_blank');
    });
  }

  cambiarOpcion(stock: number){
    this.calcularTotal();
  }

  async agregarFavorito(producto_id: string) {
    try {
      await this.crudService.agregarFavorito(producto_id);
      this.esFavorito = true;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
    }
  }

  async actualizarCalificacion(nuevaCalificacion: number) {
    if (!this.producto?.producto_id) return;
    try {
      await this.crudService.actualizarCalificacionProducto(this.producto.producto_id, this.producto.vendedor_id, nuevaCalificacion);
      this.producto.calificacion = await this.crudService.obtenerPromedioCalificacionProducto(this.producto.producto_id)
      this.tienda.calificacion = await this.crudService.obtenerPromedioCalificacionTienda(this.producto.vendedor_id);
      this.miCalificacion = nuevaCalificacion;
    } catch (error) {
      this.ionicService.mostrarAlerta('Error al actualizar la calificación', 'error');
    }
  }

  entero(calificacion: number){
    return Math.floor(calificacion || 0);
  }

  verTienda() {
    let tienda_id = this.producto.vendedor_id;
    this.router.navigate(['/tienda'], { state: { tienda_id } });
  }

  agregarAlCarrito(producto: any) {
    this.cartService.agregarProductoAlCarrito(producto.producto_id, this.opcionStock)
  }

  async eliminarFavorito(producto_id: string) {
    try {
      await this.crudService.eliminarFavorito(producto_id);
      this.esFavorito = false;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
    }
  }

  async manejarFavorito(producto: any) {
    if (this.esFavorito) {
      const favorito_id = await this.crudService.obtenerFavoritoId(producto.producto_id);
      if (favorito_id) {
        await this.crudService.eliminarFavorito(favorito_id);
      }
      this.esFavorito = false;
    } else {
      await this.crudService.agregarFavorito(producto.producto_id);
      this.esFavorito = true;
    }
  }
  
  async abrirModalEditarProducto(producto: Producto) {
    const p: any = producto; 

    const productoAdaptado: Producto = {
      ...producto,
      titulo: producto.titulo || p.producto_titulo || '',
      descripcion: producto.descripcion || p.producto_descripcion || ''
    };

    const modal = await this.modalCtrl.create({
      component: ModalEditarProductoComponent,
      componentProps: {
        initialProductData: productoAdaptado,
        userId: this.usuario?.uid || this.usuario?.id,
      },
    });

    modal.onDidDismiss().then((resultado) => {
      if (resultado.data?.actualizado) {
        this.ionicService.mostrarToastAbajo('Producto actualizado correctamente');
        this.ngOnInit();
      }
    });

    await modal.present();
  }

  async eliminarProducto(productoId: string) {
    const confirmar = await this.ionicService.confirmarAccion('¿Eliminar producto?', 'Esta acción no se puede deshacer.', );
    if (confirmar) {
      await this.crudService.eliminarProducto(productoId);
      this.ionicService.mostrarToastAbajo('Producto eliminado');
      this.router.navigate(['/home']);
    }
  }
}
