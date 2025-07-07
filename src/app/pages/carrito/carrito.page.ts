import { AuthService } from 'src/app/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud/crud.service';
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
import { Location } from '@angular/common';
import { ModalConsentimientoInformadoComponent } from 'src/app/components/modal-consentimiento.informado/modal-consentimiento.informado.component';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: false,
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

  constructor(
    private router: Router,
    private crudService: CrudService,
    private authService: AuthService,
    private cartService: CarritoService,
    private webpayService: WebpayService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private ubicacionService: UbicacionService,
    private ionicService: IonicService,
    private costoDeEnvioService: CostoDeEnvioService,
    private location: Location
  ) {}

  async ngOnInit() {
    // Comprobación de pago WebPay
    this.route.queryParams.subscribe((params) => {
      const token = params['token_ws'];
      if (token) {
        this.confirmarTransaccion(token);
      }
    });

    this.usuario = await this.authService.obtenerPerfil();

    if (this.usuario) {
      await this.obtenerDireccionPrincipal();
      this.mostrarBotonAgregarDireccion = !this.direccionPrincipal;
    }

    const carrito = await this.cartService.obtenerCarrito();

    for (const item of carrito) {
      const producto = await this.crudService.obtenerDetalleProducto(
        item.producto_id
      );

      if (producto) {
        const cantidadDeseada = item.cantidad;
        const stockDisponible = producto.stock;
        let cantidadFinal = Math.min(cantidadDeseada, stockDisponible);
        let stockAjustado = false;
        if (cantidadFinal < cantidadDeseada) {
          stockAjustado = true;
        }

        this.productos.push({
          ...producto,
          cantidad: cantidadFinal,
          cantidadDeseada: cantidadDeseada,
        });

        if (stockAjustado) {
          this.ionicService.mostrarAlerta(
            'Stock ajustado',
            `Solo quedan ${stockDisponible} unidades de "${producto.producto_titulo}", del cual querías comprar ${cantidadDeseada}. Se ajustó la cantidad a ${cantidadFinal}.`
          );
        }

        if (producto.stock <= 0 || producto.esta_eliminado) {
          this.ionicService.mostrarAlerta(
            'Sin disponibilidad',
            `El producto "${producto.producto_titulo}" no se encuentra disponible para su compra en este momento.`
          );
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
    const region = this.regiones.find((r) => r.id === regionId);
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
      this.ionicService.mostrarAlerta(
        'Stock insuficiente',
        `No hay más stock disponible para "${producto.producto_titulo}".`
      );
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

    this.costosEnvio = await this.cartService.calcularCostosEnvio(
      this.productos,
      this.direccionPrincipal
    );

    this.subtotalEnvios = Object.values(this.costosEnvio).reduce(
      (acc, val) => acc + val,
      0
    );
    this.calcularSubtotales();
  }

  obtenerCostoEnvio(producto_id: string): number {
    const producto = this.productos.find((p) => p.producto_id === producto_id);
    if (!producto || producto.stock <= 0 || producto.esta_eliminado) {
      return 0;
    }
    return this.costosEnvio[producto_id] || 0;
  }

  calcularSubtotales() {
    this.subtotalProductos = this.productos
      .filter((p) => p.stock > 0 && !p.esta_eliminado)
      .reduce((total, p) => total + this.obtenerTotalProducto(p), 0);
    this.subtotalEnvios = this.productos
      .filter((p) => p.stock > 0 && !p.esta_eliminado)
      .reduce((total, p) => total + this.obtenerCostoEnvio(p.producto_id), 0);
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
      this.ionicService.mostrarToastArriba(
        'Necesitas agregar una dirección para pagar'
      );
      await this.abrirModalDirecciones();
      if (!this.direccionPrincipal) return;
    }

    const modal = await this.modalCtrl.create({
      component: ModalConsentimientoInformadoComponent,
      breakpoints: [0, 0.85, 1],
      initialBreakpoint: 0.85,
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (!data?.aceptado) return;

    this.ionicService.mostrarCargando('Redirigiendo a WebPay...');

    const dataPago = {
      amount: this.totalAmount,
      session_id: 'sesion-' + Date.now(),
      buy_order: 'orden-' + Date.now(),
      return_url: 'fleamarket://transaction',
    };

    this.webpayService.crearTransaccion(dataPago).subscribe({
      next: (res: any) => {
        this.ionicService.ocultarCargando();

        if (res.url && res.token) {
          window.open(`${res.url}?token_ws=${res.token}`, '_system');
        } else {
          this.ionicService.mostrarAlerta(
            'Error',
            'No se pudo iniciar el pago.'
          );
        }
      },
      error: (err) => {
        this.ionicService.ocultarCargando();
        this.ionicService.mostrarAlerta(
          'Error',
          'No se pudo conectar con WebPay.'
        );
      },
      complete: () => {
        this.ionicService.ocultarCargando();
      },
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
    this.webpayService
      .confirmarTransaccion(token)
      .subscribe(async (respuesta: any) => {
        if (respuesta.status != 'AUTHORIZED' || respuesta.status == 'FAILED') {
          await this.ionicService.mostrarAlertaPromesa(
            'Pago rechazado',
            'La transacción fue rechazada por Webpay.'
          );
          return;
        }

        // 1. Filtrar productos válidos
        const productosValidos = this.productos.filter(
          (p) => p.stock > 0 && !p.esta_eliminado
        );

        // 2. Construir productosBoleta (solo lo esencial)
        const productosBoleta = productosValidos.map((p) => ({
          nombre: p.titulo || p.producto_titulo,
          precio: p.precio_oferta || p.precio,
          cantidad: p.cantidad,
          costo_envio: p.costo_envio || 0,
          direccion_origen: p.direccionOrigen || null,
          usuario_id: p.usuario_id || p.vendedor_id,
        }));

        // 3. Buscar vendedores únicos y sus datos
        const idsVendedores = [
          ...new Set(productosBoleta.map((p) => p.usuario_id)),
        ];
        const vendedoresArr = await Promise.all(
          idsVendedores.map((uid) => this.authService.obtenerUsuarioPorId(uid))
        );
        const vendedores: { [id: string]: any } = {};
        idsVendedores.forEach((id, i) => (vendedores[id] = vendedoresArr[i]));

        // 4. Generar bloque "Datos del Vendedor" para el mail
        const datosVendedorDetallados = productosBoleta
          .map((prod) => {
            const v = vendedores[prod.usuario_id] || {};
            return `
      <div style="border:1px solid #ececec; border-radius:12px; margin-bottom:14px; padding:12px;">
        <b style="color:#d1a15a">Producto:</b> ${prod.nombre}<br>
        <b>Vendedor:</b> ${v.nombre || 'Desconocido'}
        <br><b>Email:</b> ${v.email || 'No disponible'}
        <br><b>Teléfono:</b> ${v.telefono || 'No disponible'}
      </div>
    `;
          })
          .join('');

        // 5. Armar objeto de boleta para guardar en Firestore
        const boleta: Boleta = {
          usuario_id: this.usuario.id,
          fecha_creacion: new Date(),
          ordenCompra: respuesta.buy_order,
          montoPagado: respuesta.amount,
          productos: productosBoleta,
          direccion_envio: this.direccionPrincipal,
          estado: 'pagada',
          cod_autorizacion: respuesta.authorization_code,
          metodoDePago: 'webpay',
        };

        // 6. Enviar email con el resumen y los vendedores por producto
        const emailData = {
          emailUsuario: this.usuario.email,
          resumenCompra: this.generarHtmlResumenCompra(productosBoleta),
          datosVendedor: datosVendedorDetallados,
          tiempoEstimado: 'Entre 3 y 7 días hábiles',
          direccionEnvio: this.formatearDireccion(this.direccionPrincipal),
          fechaCompra: new Date().toLocaleString('es-CL'),
          montoTotal: respuesta.amount,
          ordenCompra: respuesta.buy_order,
          contactoSoporte: 'fleamarket.appchile@gmail.com',
        };

        this.http
          .post(
            'https://webpay-api.onrender.com/api/notificacion/confirmacion-compra',
            emailData
          )
          .subscribe({
            next: () => {
              this.ionicService.mostrarToastAbajo(
                '¡Se ha enviado una confirmación a tu correo!'
              );
            },
            error: () => {
              this.ionicService.mostrarToastArriba(
                'No se pudo enviar el correo de confirmación.'
              );
            },
          });

        await this.cartService.registrarCompra(
          productosValidos,
          this.direccionPrincipal,
          respuesta
        );

        this.limpiarCarrito();
        this.mostrarBoletaModal(boleta);
        this.location.replaceState('/carrito');
      });
  }

  async mostrarBoletaModal(boleta: Boleta) {
    const modal = await this.modalCtrl.create({
      component: ModalBoletaComponent,
      componentProps: { detalleBoleta: boleta },
      cssClass: 'modal-boleta-clase',
    });
    await modal.present();
  }

  limpiarCarrito() {
    this.cartService.limpiarCarrito();
    this.productos = [];
    this.calculateTotalAmount();
  }

  volverAtras() {
    this.router.navigate(['/home']);
  }

  async abrirModalDirecciones() {
    const modal = await this.modalCtrl.create({
      component: ModalFormNuevaDireccionComponent,
      breakpoints: [0, 0.85, 1],
      initialBreakpoint: 1,
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
    const direcciones =
      await this.ubicacionService.obtenerDireccionesPorUsuario(uid);
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

  private generarHtmlResumenCompra(productosBoleta: any[]): string {
    return `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr>
          <th style="border-bottom: 2px solid #d1a15a; padding: 8px 0; text-align:left;">Producto</th>
          <th style="border-bottom: 2px solid #d1a15a; padding: 8px 0; text-align:left;">Cantidad</th>
          <th style="border-bottom: 2px solid #d1a15a; padding: 8px 0; text-align:left;">Precio</th>
          <th style="border-bottom: 2px solid #d1a15a; padding: 8px 0; text-align:left;">Origen</th>
        </tr>
      </thead>
      <tbody>
        ${productosBoleta
          .map(
            (p) => `
            <tr>
              <td style="padding: 6px 0;">${p.nombre}</td>
              <td style="padding: 6px 0;">${p.cantidad}</td>
              <td style="padding: 6px 0;">$${p.precio} CLP</td>
              <td style="padding: 6px 0;">
                ${p.direccion_origen?.calle || ''} ${
              p.direccion_origen?.numero || ''
            },<br>
                ${p.direccion_origen?.comuna || ''}, ${
              p.direccion_origen?.region || ''
            }
              </td>
            </tr>
          `
          )
          .join('')}
      </tbody>
    </table>
  `;
  }

  private formatearDireccion(direccion: any): string {
    if (!direccion) return '';
    const partes = [
      direccion.calle,
      direccion.numero,
      direccion.comuna,
      direccion.region,
    ].filter(Boolean);
    return partes.join(', ');
  }
}
