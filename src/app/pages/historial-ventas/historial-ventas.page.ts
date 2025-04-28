import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-historial-ventas',
  templateUrl: './historial-ventas.page.html',
  styleUrls: ['./historial-ventas.page.scss'],
  standalone: false
})
export class HistorialVentasPage implements OnInit {
  historialVentas: { fecha: string; hora: string; producto: string; id: string; comprador: string }[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
    // Simulación de datos de ventas
    this.historialVentas = [
      { fecha: '28/04/2025', hora: '14:10', producto: 'Celular Samsung Galaxy S23', id: 'A12345', comprador: 'Juan Pérez' },
      { fecha: '27/04/2025', hora: '12:30', producto: 'Audífonos Sony WH-1000XM4', id: 'B67890', comprador: 'Laura Gómez' },
      { fecha: '26/04/2025', hora: '10:00', producto: 'Laptop Dell Inspiron 15', id: 'C11223', comprador: 'Carlos Díaz' }
    ];
  }

  volverAtras() {
    this.router.navigate(['/']); // Navega a la página principal
  }
}
