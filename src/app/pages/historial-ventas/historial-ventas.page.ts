import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial-ventas',
  templateUrl: './historial-ventas.page.html',
  styleUrls: ['./historial-ventas.page.scss'],
  standalone: false
})
export class HistorialVentasPage implements OnInit {
  historialVentas: {
    fecha: string;
    hora: string;
    productos: { id: string; nombre: string; precio: number }[];
    direccion: string;
    comuna: string;
    region: string;
    sexo: string;
    cliente: { nombre: string; correo: string };
  }[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
    // Simulación de datos de ventas con nombre y correo del cliente
    this.historialVentas = [
      {
        fecha: '28/04/2025',
        hora: '14:10',
        productos: [{ id: 'A12345', nombre: 'Celular Samsung Galaxy S23', precio: 500000 }],
        direccion: 'Av. Siempre Viva 123',
        comuna: 'Santiago Centro',
        region: 'Metropolitana',
        sexo: 'Masculino',
        cliente: { nombre: 'Juan Pérez', correo: 'juan.perez@example.com' }
      },
      {
        fecha: '27/04/2025',
        hora: '12:30',
        productos: [
          { id: 'B67890', nombre: 'Audífonos Sony WH-1000XM4', precio: 300000 },
          { id: 'C11223', nombre: 'Laptop Dell Inspiron 15', precio: 800000 }
        ],
        direccion: 'Calle Ficticia 456',
        comuna: 'Ñuñoa',
        region: 'Metropolitana',
        sexo: 'Femenino',
        cliente: { nombre: 'Laura Gómez', correo: 'laura.gomez@example.com' }
      }
    ];
  }

  volverAtras() {
    this.router.navigate(['/']);
  }
}
