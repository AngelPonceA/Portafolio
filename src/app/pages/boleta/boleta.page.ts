import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-boleta',
  templateUrl: './boleta.page.html',
  styleUrls: ['./boleta.page.scss'],
  standalone: false // Asegura que este componente no sea independiente
})
export class BoletaPage implements OnInit {
  productos = [
    { nombre: 'Botas', cantidad: 1, precio: 50000, idVariante: 'VAR001' },
    { nombre: 'Botas 2', cantidad: 2, precio: 30000, idVariante: 'VAR002' },
  ];

  constructor() {}

  ngOnInit(): void {
    // Inicialización del componente
    console.log('Componente Boleta inicializado');
  }

  /**
   * Calcula el total de la boleta
   * @returns Total de los productos
   */
  obtenerTotalBoleta(): number {
    return this.productos.reduce((total, producto) => total + (producto.cantidad * producto.precio), 0);
  }

  /**
   * Solicita un reembolso para un producto específico
   * @param idVariante ID único de la variante del producto
   */
  solicitarReembolso(idVariante: string): void {
    console.log(`Iniciando reembolso para el ID de variante: ${idVariante}`);
    alert(`Reembolso solicitado para el producto con ID variante: ${idVariante}`);
    // Aquí puedes implementar lógica adicional, como llamar a un API o registrar la solicitud
  }
}
