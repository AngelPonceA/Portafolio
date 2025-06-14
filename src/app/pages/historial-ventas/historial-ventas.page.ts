import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-historial-ventas',
  templateUrl: './historial-ventas.page.html',
  styleUrls: ['./historial-ventas.page.scss'],
  standalone: false
})
export class HistorialVentasPage implements OnInit {

  historialVentas?: any[] | undefined;

  detalleSeleccionado: any = null;

  subtotal? : number;

  constructor(private router: Router, private crudService: CrudService, private navCtrl: NavController) {}

  async ngOnInit() {

    const lista = await this.crudService.obtenerHistorialVentas();
    this.historialVentas = Array.isArray(lista) ? lista : [];

   }

  calcularTotalVenta(venta: any): number {
    if (!venta.detalles || !Array.isArray(venta.detalles)) { 
      return 0;
    }
    return venta.detalles.reduce((total: number, detalle: any) => {
      // Suma cantidad * valor_unitario de cada detalle
      return total + (detalle.cantidad * detalle.subtotal);
    }, 0);
  }

  verDetalle(pedido: any) {
    this.detalleSeleccionado = pedido;
  }

  verProducto(producto_id: string){
    this.detalleSeleccionado = null;
    setTimeout(() => {
      this.router.navigate(['/producto'], { state: { producto_id } });
    }, 100);
  }

  volverAtras() {
    this.navCtrl.back();
  }
}
