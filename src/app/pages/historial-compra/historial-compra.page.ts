import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-historial-compra',
  templateUrl: './historial-compra.page.html',
  styleUrls: ['./historial-compra.page.scss'],
  standalone: false
})
export class HistorialCompraPage implements OnInit {
  historialCompra: {
    fecha: string;
    hora: string;
    productos: { id: string; nombre: string; precio: number }[];
    direccion: string;
    comuna: string;
    region: string;
    sexo: string;
    cliente: { nombre: string; correo: string };
  }[] = [];

  constructor(private router: Router, private navCtrl: NavController) {}

  async ngOnInit() {
    // Simulación de datos con nombre y correo del cliente
    this.historialCompra = [
      {
        fecha: '28/04/2025',
        hora: '16:10',
        productos: [{ id: '12345', nombre: 'Celular Samsung Galaxy S23', precio: 500000 }],
        direccion: 'Av. Siempre Viva 123',
        comuna: 'Santiago Centro',
        region: 'Metropolitana',
        sexo: 'Masculino',
        cliente: { nombre: 'Juan Pérez', correo: 'juan.perez@example.com' }
      },
      {
        fecha: '27/04/2025',
        hora: '14:30',
        productos: [
          { id: '11223', nombre: 'Laptop Dell Inspiron 15', precio: 800000 },
          { id: '44567', nombre: 'Monitor LG UltraGear', precio: 200000 }
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
    this.navCtrl.back();
  }
}
