import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-historial-compra',
  templateUrl: './historial-compra.page.html',
  styleUrls: ['./historial-compra.page.scss'],
  standalone: false
})
export class HistorialCompraPage implements OnInit {
  historialCompra: { fecha: string; hora: string; producto: string; id: string }[] = [];

  constructor(private router: Router, private crudService: CrudService, private authService: AuthService) {}

  async ngOnInit() {
    // Aquí deje una simulación de datos de compra
    this.historialCompra = [
      { fecha: '28/04/2025', hora: '16:10', producto: 'Celular Samsung Galaxy S23', id: '12345' },
      { fecha: '27/04/2025', hora: '14:30', producto: 'Audífonos Sony WH-1000XM4', id: '67890' },
      { fecha: '26/04/2025', hora: '10:15', producto: 'Laptop Dell Inspiron 15', id: '11223' }
    ];
  }

  volverAtras() {
    this.router.navigate(['/']); // Navega a la ruta principal
  }
}
