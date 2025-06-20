import { AuthService } from 'src/app/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud/crud.service';
import { timeInterval } from 'rxjs';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { WebpayService } from 'src/app/services/webpay/webpay.service';
import { HttpClient } from '@angular/common/http';
import { ModalBoletaComponent } from 'src/app/components/modal-boleta/modal-boleta.component';
import { ModalFormNuevaDireccionComponent } from 'src/app/components/modal-form-nueva-direccion/modal-form-nueva-direccion.component';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { UbicacionService } from 'src/app/services/ubicacion/ubicacion.service';
import { Region } from 'src/app/models/region.models';
import { IonicService } from 'src/app/services/ionic/ionic.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: false
})
export class CarritoPage implements OnInit {

  productos: any[] = [];
  totalAmount: number = 0;
  costosEnvio: { [key: string]: number } = {};
  subtotalProductos: number = 0;
  subtotalEnvios: number = 0;
  usuario: any;
  regiones: Region[] = [];
  comunas: string[] = [];
  regionSeleccionada: number | null = null;
  comunaSeleccionada: string | null = null;
  
  direccionPrincipal: any = null;
  direccionesUsuario: any[] = [];

  constructor(private router: Router, 
                private crudService: CrudService, 
                private authService: AuthService, 
                private cartService: CarritoService,
                private webpayService: WebpayService,
                private route: ActivatedRoute,
                private http: HttpClient,
                private modalCtrl: ModalController,
                private ubicacionService: UbicacionService,
                private ionicService: IonicService
              ) {}
  
  async ngOnInit() {
    await this.agregarProductoAlCarrito('1xIt9YlbiogSYPtqxlgP');
    await this.agregarProductoAlCarrito('q4GE9IBSWX2Xk1S8iOVA');

    this.usuario = await this.authService.obtenerPerfil();

    if (this.usuario){
      await this.obtenerDireccionPrincipal();
    }

    // const carrito = await this.cartService.obtenerCarrito();

    // for (const item of carrito) {
    //   const producto = await this.crudService.obtenerDetalleProducto(item.producto_id);

    //   if (producto) {
    //     const cantidadDeseada = item.cantidad;
    //     const stockDisponible = producto.stock;

    //     const cantidadFinal = Math.min(cantidadDeseada, stockDisponible);

    //     if (cantidadFinal < cantidadDeseada) {
    //       this.ionicService.mostrarAlerta('Stock ajustado', `Solo quedan ${stockDisponible} unidades de "${producto.producto_titulo}", 
    //         del cual querías comprar ${cantidadDeseada}`);
    //     }

    //     this.productos.push({
    //       ...producto, cantidad: cantidadFinal,
    //     });
    //   }
    // }

    await this.calcularCostosEnvio();
    await this.calculateTotalAmount();

    this.regiones = this.ubicacionService.getRegiones();

    const token = this.route.snapshot.queryParamMap.get('token_ws');
    if (token) {
      this.confirmarTransaccion(token);
    }
  }

  ngAfterViewInit() {
    const boton = document.querySelector('.webpay-button');
    if (boton) {
      boton.addEventListener('touchstart', () => {
        boton.classList.add('animar-overlay');
        setTimeout(() => boton.classList.remove('animar-overlay'), 500);
      });
    }
  }


  onRegionChange(event: any) {
    const regionId = event.detail.value;
    this.regionSeleccionada = regionId;
    const region = this.regiones.find(r => r.id === regionId);
    if (region) {
      this.ubicacionService.setRegionSeleccionada(region);
      this.comunas = region.comunas;
    } else {
      this.comunas = [];
    }
    this.comunaSeleccionada = null;
    this.calcularCostosEnvio();
  }

  onComunaChange(event: any) {
    this.comunaSeleccionada = event.detail.value;
    if (this.comunaSeleccionada !== null) {
      this.ubicacionService.setComunaSeleccionada(this.comunaSeleccionada);
    }
    this.calcularCostosEnvio();
  }

  verDetalle(producto_id: string) {
    this.router.navigate(['/producto'], { state: { producto_id } });
  }

  async agregarProductoAlCarrito(producto_id: string) {
    const detalleProducto = await this.crudService.obtenerDetalleProducto(producto_id);
    
    let cantidad = 1;
    if (detalleProducto) {
      if (detalleProducto.stock <= 0) {
        cantidad = 0;  
      }
  
      this.productos.push({
        vendedor_id: detalleProducto.vendedor_id,
        producto_id: detalleProducto.producto_id,
        producto_titulo: detalleProducto.producto_titulo,
        descripcion: detalleProducto.producto_descripcion,
        precio: detalleProducto.precio,
        precio_oferta: detalleProducto.precio_oferta,
        etiquetas: detalleProducto.etiquetas,
        estado: detalleProducto.estado,
        stock: detalleProducto.stock,
        imagen: detalleProducto.imagen,
        cantidad,
      });
  
      await this.calcularCostosEnvio();
      await this.calculateTotalAmount();

    } else {
      this.ionicService.mostrarToastAbajo('No se pudo obtener el producto');
    }
  }

  async restarProducto(producto_id: string) {
    const producto = this.productos.find((p) => p.producto_id === producto_id);
    if (producto && producto.cantidad > 1) {
      producto.cantidad--;
      // await this.cartService.carritoSumarRestar('restar', producto.cantidad, producto_id);
      await this.calculateTotalAmount();
    }
  }

  async sumarProducto(producto_id: string) {
    const producto = this.productos.find((p) => p.producto_id === producto_id);
    if (producto && producto.stock >= producto.cantidad + 1) {
      producto.cantidad++;
      // await this.cartService.carritoSumarRestar('sumar', producto.cantidad, producto_id);
      await this.calculateTotalAmount();      
    }    
  }

  quitarProducto(producto_id: string) {
    this.productos = this.productos.filter((p) => p.producto_id != producto_id);
    // this.cartService.eliminarProductoDelCarrito(producto_id);
    this.calculateTotalAmount();
  }

  async calcularCostosEnvio() {
    for (const producto of this.productos) {
      if (producto.stock && producto.stock > 0) {
        const costoEnvio = await this.cartService.calcularCostoEnvioProducto(producto);
        producto.costo_envio = costoEnvio;
        this.costosEnvio[producto.producto_id] = costoEnvio;
      }
    }
    this.calcularSubtotales();
  }


  obtenerCostoEnvio(producto_id: string): number {
    return this.costosEnvio[producto_id] || 0;
  }

  calcularSubtotales() {
    this.subtotalProductos = this.productos.reduce((total, p) => total + this.obtenerTotalProducto(p), 0);
    this.subtotalEnvios = this.productos.reduce((total, p) => total + this.obtenerCostoEnvio(p.producto_id), 0);
  }

  async calculateTotalAmount() {
    this.calcularSubtotales();
    this.totalAmount = this.subtotalProductos + this.subtotalEnvios;
  }

  obtenerTotalProducto(producto: any) {
    return (producto.precio_oferta || producto.precio) * producto.cantidad;
  }

  obtenerTotalCarrito() {
    return this.totalAmount;
  }

  iniciarPagoWebpay() {
    const data = {
      amount: this.totalAmount,
      session_id: 'sesion-' + Date.now(), 
      buy_order: 'orden-' + Date.now()   
    };

    this.webpayService.crearTransaccion(data).subscribe((res: any) => {
      if (res.url && res.token) {
        this.redirigirAWebpay(res.url, res.token);
      }
    });
  }

  redirigirAWebpay(url: string, token: string) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'token_ws';
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }

  confirmarTransaccion(token: string) {
    this.webpayService.confirmarTransaccion(token).subscribe((respuesta: any) => {
      this.cartService.registrarCompra(this.productos, this.direccionPrincipal, respuesta);
      console.log(respuesta);
      
      this.limpiarCarrito();
      this.mostrarBoletaModal({
        fecha: new Date(),
        productos: this.productos,
        monto: respuesta.amount,
        autorizacion: respuesta.authorization_code,
        ordenCompra: respuesta.buy_order,
        transaccion: respuesta
      });
    });
  }

  async mostrarBoletaModal(detalleBoleta: any) {
    const modal = await this.modalCtrl.create({
      component: ModalBoletaComponent,
      componentProps: { detalleBoleta },
      cssClass: 'modal-boleta-clase'
    });
    await modal.present();
  }

  limpiarCarrito() {
    this.productos = []; 
    this.calculateTotalAmount();
  }

  volverAtras()  {
    this.router.navigate(['/home']);
  }

  async abrirModalDirecciones() {
    const modal = await this.modalCtrl.create({
      component: ModalFormNuevaDireccionComponent,
      breakpoints: [0, 0.85, 1],
      initialBreakpoint: 1
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.direccionPrincipal = data;
      this.direccionesUsuario.unshift(data);
    }
  }

  async obtenerDireccionPrincipal() {
    const uid = this.usuario.id;    
    const direcciones = await this.ubicacionService.obtenerDireccionesPorUsuario(uid);
    this.direccionesUsuario = direcciones;
    if (direcciones.length > 0) {
      this.direccionPrincipal = direcciones[0];
    }
  }

}
