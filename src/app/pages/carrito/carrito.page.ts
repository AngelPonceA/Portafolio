import { AuthService } from 'src/app/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud/crud.service';
import { timeInterval } from 'rxjs';
import { CarritoService } from 'src/app/services/carrito/carrito.service';

type Comuna = 'STGO' | 'MAIPU' | 'LA_FLORIDA' | 'PROVIDENCIA' | 'LAS_CONDES';

declare const paypal: any; 

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
  comunaDestino: Comuna = 'STGO';
  subtotalProductos: number = 0;
  subtotalEnvios: number = 0;
  
  constructor(private router: Router, private crudService: CrudService, private authService: AuthService, private cartService: CarritoService) {}
  
  async ngOnInit() {
    await this.agregarProductoAlCarrito('1xIt9YlbiogSYPtqxlgP');
    await this.agregarProductoAlCarrito('q4GE9IBSWX2Xk1S8iOVA');
    await this.calculateTotalAmount();
    await this.calcularCostosEnvio();
    this.iniciarBotonPaypal(); 
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
  
      await this.calculateTotalAmount();
      await this.calcularCostosEnvio();

    } else {
      console.error('No se pudo obtener el producto.');
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
      this.costosEnvio[producto.producto_id] = await this.cartService.calcularCostoEnvioProducto(producto);
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

  iniciarBotonPaypal() {
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            { amount: {
                value: (this.totalAmount / 1000).toFixed(2),
                currency_code: 'USD',
              },
            },
          ],
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          this.cartService.registrarCompra(this.productos, details);
          console.log('Pago exitoso:', details);
          this.limpiarCarrito(); 
          const paypalBtn = document.getElementById('paypal-button-container');
          if (paypalBtn) {
            paypalBtn.innerHTML = '';
          }
        });
      },
      onError: (err: any) => {
        console.log('Error durante el pago:', err);
        console.log('Ocurrió un error al procesar el pago. Por favor intenta nuevamente.');
      },
    }).render('#paypal-button-container');
  }


  limpiarCarrito() {
    this.productos = []; 
    this.calculateTotalAmount();
  }

  volverAtras()  {
    this.router.navigate(['/home']);
  }

  async actualizarComuna(comuna: Comuna) {
    this.comunaDestino = comuna;
    this.cartService.setComunaDestino(comuna);
    await this.calcularCostosEnvio();
    await this.calculateTotalAmount();
  }
}
