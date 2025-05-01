import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare const paypal: any; // Importa el SDK global de PayPal

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: false
})
export class CarritoPage implements OnInit {
  productos = [
    {
      id: 1,
      nombre: 'Botas',
      precio: 50000,
      cantidad: 1,
      stock: 5,
      imagen: 'https://imgs.search.brave.com/VUlm4eamkknVVPCZ1wIZRKifh8YVPS19JnhzVf8_EiA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jYXRl/cnBpbGxhcnN2LmNv/bS9jZG4vc2hvcC9m/aWxlcy8zMDA3MTA2/Nl80MDY1NmEwMC05/NDFiLTQ1YWMtOTU5/Ny05Mzc1MTAyMmMx/MmFfMTAyNHgxMDI0/LmpwZz92PTE3NDA3/MjcxNzk',
    },
    {
      id: 2,
      nombre: 'Botas 2',
      precio: 50000,
      cantidad: 1,
      stock: 5,
      imagen: 'https://imgs.search.brave.com/VUlm4eamkknVVPCZ1wIZRKifh8YVPS19JnhzVf8_EiA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jYXRl/cnBpbGxhcnN2LmNv/bS9jZG4vc2hvcC9m/aWxlcy8zMDA3MTA2/Nl80MDY1NmEwMC05/NDFiLTQ1YWMtOTU5/Ny05Mzc1MTAyMmMx/MmFfMTAyNHgxMDI0/LmpwZz92PTE3NDA3/MjcxNzk',
    },
  ];

  totalAmount: number = 0; // Total calculado del carrito

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.calculateTotalAmount(); // Calcula el total inicial
    this.initializePayPalButton(); // Inicia el botón de PayPal
  }

  /**
   * Resta la cantidad de un producto
   * @param id El ID del producto
   */
  restarProducto(id: number): void {
    const producto = this.productos.find((p) => p.id === id);
    if (producto && producto.cantidad > 1) {
      producto.cantidad--;
      this.calculateTotalAmount();
    }
  }

  /**
   * Aumenta la cantidad de un producto
   * @param id El ID del producto
   */
  sumarProducto(id: number): void {
    const producto = this.productos.find((p) => p.id === id);
    if (producto && producto.stock >= producto.cantidad + 1) {
      producto.cantidad++;
      this.calculateTotalAmount();
    }
  }

  /**
   * Elimina un producto del carrito
   * @param id El ID del producto
   */
  quitarProducto(id: number): void {
    this.productos = this.productos.filter((p) => p.id !== id);
    this.calculateTotalAmount();
  }

  /**
   * Calcula el total del carrito
   */
  calculateTotalAmount(): void {
    this.totalAmount = this.productos.reduce(
      (total, p) => total + this.obtenerTotalProducto(p),
      0
    );
  }

  /**
   * Obtiene el subtotal de un producto
   * @param producto Objeto del producto
   * @returns Subtotal del producto
   */
  obtenerTotalProducto(producto: any): number {
    return producto.precio * producto.cantidad;
  }

  /**
   * Retorna el total calculado del carrito
   * @returns Total del carrito
   */
  obtenerTotalCarrito(): number {
    return this.totalAmount;
  }

  /**
   * Pagar todo (solo muestra el total actual)
   */
  pagarTodo(): void {
    console.log(`Total del carrito: $${this.totalAmount.toFixed(2)}. Procesando pago...`);
  }

  /**
   * Inicializa el botón de PayPal
   */
  initializePayPalButton(): void {
    // Validar que el monto sea mayor a cero
    if (this.totalAmount <= 0) {
      console.error('El monto total debe ser mayor a cero para proceder con el pago.');
      alert('Tu carrito está vacío. Agrega productos para pagar.');
      return;
    }

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        // Crear orden en PayPal usando el monto total del carrito
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
    }).render('#paypal-button-container'); // Renderiza el botón PayPal en el contenedor
  }

  /**
   * Limpia el carrito después de un pago exitoso
   */
  limpiarCarrito(): void {
    this.productos = []; // Vacía el carrito después del pago
    this.calculateTotalAmount();
    this.router.navigate(['/']); // Redirige a la página principal
  }

  /**
   * Vuelve a la página anterior
   */
  volverAtras(): void {
    this.router.navigate(['/']); // Navega a la página anterior
  }
}

