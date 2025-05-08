import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-boleta',
  templateUrl: './boleta.page.html',
  styleUrls: ['./boleta.page.scss'],
  standalone: false 
})
export class BoletaPage implements OnInit {
  productos = [
    { nombre: 'Botas', cantidad: 1, precio: 50000, idVariante: 'VAR001' },
    { nombre: 'Botas 2', cantidad: 2, precio: 30000, idVariante: 'VAR002' },
  ];

  constructor() {}

  ngOnInit(): void {
    
    console.log('Componente Boleta inicializado');
  }

  /**
   * 
   * @returns 
   */
  obtenerTotalBoleta(): number {
    return this.productos.reduce((total, producto) => total + (producto.cantidad * producto.precio), 0);
  }

  /**
   * 
   * @param idVariante 
   */
  solicitarReembolso(idVariante: string): void {
    console.log(`Iniciando reembolso para el ID de variante: ${idVariante}`);
    alert(`Reembolso solicitado para el producto con ID variante: ${idVariante}`);
    // Aquí puedes implementar lógica adicional, como llamar a un API o registrar la solicitud
  }
}
