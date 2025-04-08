import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CarritoPage {
  productos = [
    { id: 1, nombre: 'Producto 1', precio: 19.99, cantidad: 1, precioOriginal: 29.99 },
    { id: 2, nombre: 'Producto 2', precio: 15.49, cantidad: 1, precioOriginal: 20.00 },
    { id: 3, nombre: 'Producto 3', precio: 9.99, cantidad: 1, precioOriginal: 12.00 },
    { id: 4, nombre: 'Producto 4', precio: 24.99, cantidad: 1, precioOriginal: 30.00 }
  ];

  constructor(private router: Router) {}

  restarProducto(id: number) {
    const producto = this.productos.find(p => p.id === id);
    if (producto && producto.cantidad > 1) {
      producto.cantidad--;
    }
  }

  sumarProducto(id: number) {
    const producto = this.productos.find(p => p.id === id);
    if (producto) {
      producto.cantidad++;
    }
  }

  comprarProducto(id: number) {
    const producto = this.productos.find(p => p.id === id);
    if (producto) {
      console.log(`Comprando ${producto.nombre}, cantidad: ${producto.cantidad}, total: $${(producto.precio * producto.cantidad).toFixed(2)}`);
    }
  }

  obtenerTotalProducto(producto: any): number {
    return producto.precio * producto.cantidad;
  }

  obtenerTotalCarrito(): number {
    return this.productos.reduce((total, p) => total + this.obtenerTotalProducto(p), 0);
  }

  pagarTodo() {
    console.log(`Total del carrito: $${this.obtenerTotalCarrito().toFixed(2)}. Procesando pago...`);
  }

  volverAtras() {
    this.router.navigate(['/']);  // Redirige a la página anterior (ajusta la ruta según tu necesidad)
  }
}