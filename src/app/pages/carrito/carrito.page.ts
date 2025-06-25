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
import { CostoDeEnvioService } from 'src/app/services/costo-de-envio/costo-de-envio.service';
import { Boleta } from 'src/app/models/boleta/boleta.models';

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
  
  mostrarBotonAgregarDireccion = false;
  direccionPrincipal: any = null;
  direccionesUsuario: any[] = [];

  constructor(private router: Router, private crudService: CrudService, private authService: AuthService,
    private cartService: CarritoService, private webpayService: WebpayService, private route: ActivatedRoute, private http: HttpClient, 
    private modalCtrl: ModalController, private ubicacionService: UbicacionService, private ionicService: IonicService,
    private costoDeEnvioService: CostoDeEnvioService
  ) {}
  
  async ngOnInit() {
    // Esto es clave, es la comprobación de pago para WebPay
    this.route.queryParams.subscribe(params => {
      const token = params['token_ws'];
      if (token) {
        this.confirmarTransaccion(token);
      }
    });

    this.usuario = await this.authService.obtenerPerfil();

    if (this.usuario){
      await this.obtenerDireccionPrincipal();

      this.mostrarBotonAgregarDireccion = !this.direccionPrincipal;
    }

    const carrito = await this.cartService.obtenerCarrito();

    for (const item of carrito) {
      const producto = await this.crudService.obtenerDetalleProducto(item.producto_id);

      if (producto) {
        const cantidadDeseada = item.cantidad;
        const stockDisponible = producto.stock;

        let cantidadFinal = Math.min(cantidadDeseada, stockDisponible);
        let stockAjustado = false;
        if (cantidadFinal < cantidadDeseada) {
          stockAjustado = true;
        }

        this.productos.push({
          ...producto, cantidad: cantidadFinal, cantidadDeseada: cantidadDeseada
        });

        if (stockAjustado) {
          this.ionicService.mostrarAlerta('Stock ajustado', `Solo quedan ${stockDisponible} unidades de "${producto.producto_titulo}", del cual querías comprar ${cantidadDeseada}. Se ajustó la cantidad a ${cantidadFinal}.`);
        }
      }
    }

    await this.calcularCostosEnvio();
    await this.calculateTotalAmount();

    this.regiones = this.ubicacionService.getRegiones();
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

  async restarProducto(producto_id: string) {
    const producto = this.productos.find((p) => p.producto_id === producto_id);
    if (producto && producto.cantidad > 1) {
      producto.cantidad--;
      await this.cartService.carritoSumarRestar('restar', 1, producto_id);
      await this.calcularCostosEnvio();
      await this.calculateTotalAmount();
    }
  }

  async sumarProducto(producto_id: string) {
    const producto = this.productos.find((p) => p.producto_id === producto_id);
    if (producto && producto.stock > producto.cantidad) {
      producto.cantidad++;
      await this.cartService.carritoSumarRestar('sumar', 1, producto_id);
      await this.calcularCostosEnvio();
      await this.calculateTotalAmount();
    } else if (producto && producto.stock <= producto.cantidad) {
      this.ionicService.mostrarAlerta('Stock insuficiente', `No hay más stock disponible para "${producto.producto_titulo}".`);
    }
  }

  async quitarProducto(producto_id: string) {
    this.productos = this.productos.filter((p) => p.producto_id != producto_id);
    await this.cartService.eliminarProductoDelCarrito(producto_id);
    await this.calcularCostosEnvio();
    await this.calculateTotalAmount();
  }

  async calcularCostosEnvio() {
    if (!this.direccionPrincipal || this.productos.length === 0) {
      this.subtotalEnvios = 0;
      return;
    }

    this.costosEnvio = await this.cartService.calcularCostosEnvio(this.productos, this.direccionPrincipal);

    this.subtotalEnvios = Object.values(this.costosEnvio).reduce((acc, val) => acc + val, 0);
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

  async iniciarPagoWebpay() {
    if (!this.direccionPrincipal) {
      this.ionicService.mostrarToastArriba('Necesitas agregar una dirección para pagar');
      await this.abrirModalDirecciones(); 
      if (!this.direccionPrincipal) return; 
    }

    const data = {
      amount: this.totalAmount,
      session_id: 'sesion-' + Date.now(),
      buy_order: 'orden-' + Date.now(),
      return_url: 'fleamarket://transaction'
    };

    this.webpayService.crearTransaccion(data).subscribe((res: any) => {
      if (res.url && res.token) {
        window.open(`${res.url}?token_ws=${res.token}`, '_system');
      } else {
        this.ionicService.mostrarAlerta('Error', 'No se pudo iniciar el pago.');
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

  async confirmarTransaccion(token: string) {
    this.webpayService.confirmarTransaccion(token).subscribe(async(respuesta: any) => {
      const productosBoleta = this.productos.map(p => ({
        nombre: p.producto_titulo,
        precio: p.precio_oferta || p.precio,
        cantidad: p.cantidad,
        costo_envio: p.costo_envio || 0
      }));

      const boleta: Boleta = {
        usuario_id: this.usuario.id,
        fecha_creacion: new Date(),
        ordenCompra: respuesta.buy_order,
        montoPagado: respuesta.amount,
        productos: productosBoleta,
        direccion_envio: this.direccionPrincipal,
        estado: 'pagada',
        cod_autorizacion: respuesta.authorization_code,
        metodoDePago: 'webpay'
      };

      await this.cartService.registrarCompra(this.productos, this.direccionPrincipal, respuesta);

      this.limpiarCarrito();
      this.mostrarBoletaModal(boleta);
  });
  }

  async mostrarBoletaModal(boleta: Boleta) {
    const modal = await this.modalCtrl.create({
      component: ModalBoletaComponent,
      componentProps: { detalleBoleta: boleta },
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
      this.mostrarBotonAgregarDireccion = false;

      this.ionicService.mostrarToastArriba('Dirección guardada con éxito');

      await this.calcularCostosEnvio(); 
      await this.calculateTotalAmount(); 
    }
  }

  async obtenerDireccionPrincipal() {
    const uid = this.usuario.id;
    const direcciones = await this.ubicacionService.obtenerDireccionesPorUsuario(uid);
    this.direccionesUsuario = direcciones;

    if (direcciones.length > 0) {
      this.direccionPrincipal = direcciones[0];
      this.mostrarBotonAgregarDireccion = false;
    } else {
      this.direccionPrincipal = null;
      this.mostrarBotonAgregarDireccion = true;
    }

    await this.calcularCostosEnvio();
    await this.calculateTotalAmount();

  }

}
