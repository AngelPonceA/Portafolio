import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: false,
})
export class CarritoPage {
  productos = [
    { id: 1, nombre: 'Botas', precio: 50000, cantidad: 1, stock: 5, oferta: 50, imagen: "https://imgs.search.brave.com/VUlm4eamkknVVPCZ1wIZRKifh8YVPS19JnhzVf8_EiA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jYXRl/cnBpbGxhcnN2LmNv/bS9jZG4vc2hvcC9m/aWxlcy8zMDA3MTA2/Nl80MDY1NmEwMC05/NDFiLTQ1YWMtOTU5/Ny05Mzc1MTAyMmMx/MmFfMTAyNHgxMDI0/LmpwZz92PTE3NDA3/MjcxNzk"},
    { id: 2, nombre: 'Botas 2', precio: 50000, cantidad: 1, stock: 5, oferta: 50, imagen: "https://imgs.search.brave.com/VUlm4eamkknVVPCZ1wIZRKifh8YVPS19JnhzVf8_EiA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jYXRl/cnBpbGxhcnN2LmNv/bS9jZG4vc2hvcC9m/aWxlcy8zMDA3MTA2/Nl80MDY1NmEwMC05/NDFiLTQ1YWMtOTU5/Ny05Mzc1MTAyMmMx/MmFfMTAyNHgxMDI0/LmpwZz92PTE3NDA3/MjcxNzk"},

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
    if (producto && producto.stock >= producto.cantidad + 1) {
      producto.cantidad++;
    }
  }

  quitarProducto(id: number) {
    this.productos = this.productos.filter(p => p.id !== id);
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
    this.router.navigate(['/']);
  }
}
