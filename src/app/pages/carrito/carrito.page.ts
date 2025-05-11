import { AuthService } from 'src/app/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud/crud.service';
import { timeInterval } from 'rxjs';
import { CarritoService } from 'src/app/services/carrito/carrito.service';

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
  
  constructor(private router: Router, private crudService: CrudService, private authService: AuthService, private cartService: CarritoService) {}
  
  async ngOnInit() {
    await this.agregarProductoAlCarrito('1xIt9YlbiogSYPtqxlgP');

    await this.calculateTotalAmount();
    this.iniciarBotonPaypal(); 
  }

  verDetalle(producto_id: string) {
    this.router.navigate(['/producto'], { state: { producto_id } });
  }

  async agregarProductoAlCarrito(variante_id: string) {
    const detalleVariante = await this.crudService.obtenerDetalleProducto(variante_id);
  
    if (detalleVariante) {
  
      this.productos.push({
        vendedor_id: detalleVariante.vendedor_id,
        producto_titulo: detalleVariante.producto_titulo,
        descripcion: detalleVariante.producto_descripcion,
        precio: detalleVariante.precio,
        precio_oferta: detalleVariante.precio_oferta,
        atributo: detalleVariante.atributo,
        estado: detalleVariante.estado,
        stock: detalleVariante.stock,
        imagen: detalleVariante.imagen,
        cantidad: 1,
      });
  
      this.calculateTotalAmount();

    } else {
      console.error('No se pudo obtener la variante.');
    }
  }

  restarProducto(producto_id: string) {
    const producto = this.productos.find((p) => p.producto_id === producto_id);
    if (producto && producto.cantidad > 1) {
      producto.cantidad--;
      this.calculateTotalAmount();
    }
  }

  sumarProducto(producto_id: string) {
    const producto = this.productos.find((p) => p.producto_id === producto_id);
    if (producto && producto.stock >= producto.cantidad + 1) {
      producto.cantidad++;
      this.calculateTotalAmount();      
    }    
  }

  quitarProducto(producto_id: string) {
    this.productos = this.productos.filter((p) => p.producto_id != producto_id);
    this.calculateTotalAmount();
  }

  async calculateTotalAmount() {
    this.totalAmount = await this.productos.reduce(
      (total, p) => total + this.obtenerTotalProducto(p),
      0
    );
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
          this.iniciarBotonPaypal();
          this.limpiarCarrito(); 
        });
      },
      onError: (err: any) => {
        console.error('Error durante el pago:', err);
        alert('Ocurrió un error al procesar el pago. Por favor intenta nuevamente.');
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
}

