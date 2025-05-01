import { AuthService } from 'src/app/services/auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud/crud.service';
import { timeInterval } from 'rxjs';

declare const paypal: any; // Importa el SDK global de PayPal

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: false
})
export class CarritoPage implements OnInit {

  productos: any[] = [];
  totalAmount: number = 0;
  
  constructor(private router: Router, private crudService: CrudService, private authService: AuthService) {}
  
  async ngOnInit() {
    await this.agregarProductoAlCarrito('QESMssNIMt49iO8e4cgC');
    await this.agregarProductoAlCarrito('l15FYjMuUnyP4MlTP1IT');
    this.calculateTotalAmount(); // Calcula el total inicial
    this.initializePayPalButton(); // Inicia el botón de PayPal
  }    

  ngAfterViewInit() {
    this.initializePayPalButton();
  }

  verDetalle(variante_id: string) {
    this.router.navigate(['/producto'], { state: { variante_id } });
  }

  async agregarProductoAlCarrito(variante_id: string) {
    const detalleVariante = await this.crudService.obtenerDetalleVariante(variante_id);
  
    if (detalleVariante) {
      console.log('Detalles de la variante:', detalleVariante);
  
      this.productos.push({
        id: detalleVariante.variante_id,
        nombre: detalleVariante.producto_titulo,
        descripcion: detalleVariante.producto_descripcion,
        precio: detalleVariante.precio,
        variante_id: detalleVariante.variante_id,
        precio_oferta: detalleVariante.precio_oferta,
        stock: detalleVariante.stock,
        imagen: detalleVariante.imagen,
        cantidad: 1,
      });
  
      this.calculateTotalAmount();

      
    } else {
      console.error('No se pudo obtener la variante.');
    }
  }

  restarProducto(id: number) {
    const producto = this.productos.find((p) => p.id === id);
    if (producto && producto.cantidad > 1) {
      producto.cantidad--;
      this.calculateTotalAmount();
    }
  }

  sumarProducto(id: number) {
    const producto = this.productos.find((p) => p.id === id);
    if (producto && producto.stock >= producto.cantidad + 1) {
      producto.cantidad++;
      this.calculateTotalAmount();
    }
  }

  quitarProducto(id: number) {
    this.productos = this.productos.filter((p) => p.id !== id);
    this.calculateTotalAmount();
  }

  async calculateTotalAmount() {
    this.totalAmount = await this.productos.reduce(
      (total, p) => total + this.obtenerTotalProducto(p),
      0
    );
  }

  obtenerTotalProducto(producto: any) {
    return producto.precio * producto.cantidad;
  }

  obtenerTotalCarrito() {
     return this.totalAmount;
  }

  pagarTodo() {
    console.log(`Total del carrito: $${this.totalAmount.toFixed(2)}. Procesando pago...`);
  }

  initializePayPalButton() {

    if (this.totalAmount <= 0) {
      return;
    }

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: (this.totalAmount / 1000).toFixed(2), // Conversión de CLP a USD si aplica
                currency_code: 'USD',
              },
            },
          ],
        });
      },
      onApprove: (data: any, actions: any) => {
        // Capturar pago aprobado por el usuario
        return actions.order.capture().then((details: any) => {
          console.log('Pago exitoso:', details);
          alert(`Pago realizado por ${details.payer.name.given_name}.`);
          this.limpiarCarrito(); // Limpia el carrito después del pago
        });
      },
      onError: (err: any) => {
        // Manejo de errores
        console.error('Error durante el pago:', err);
        alert('Ocurrió un error al procesar el pago. Por favor intenta nuevamente.');
      },
    }).render('#paypal-button-container');
  }


  limpiarCarrito(): void {
    this.productos = []; 
    this.calculateTotalAmount();
  }

  volverAtras()  {
    this.router.navigate(['/home']);
  }
}

