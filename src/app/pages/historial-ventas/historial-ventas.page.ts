import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud/crud.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';

@Component({
  selector: 'app-historial-ventas',
  templateUrl: './historial-ventas.page.html',
  styleUrls: ['./historial-ventas.page.scss'],
  standalone: false
})
export class HistorialVentasPage implements OnInit {

  historialVentas?: any[] | undefined;

  detalleSeleccionado: any = null;


  constructor(private router: Router, private crudService: CrudService, private navCtrl: NavController,
    private ionicService: IonicService ) {}

  async ngOnInit() {

    const lista = await this.crudService.obtenerHistorialVentas();
    this.historialVentas = Array.isArray(lista) ? lista : [];

   }

  calcularTotal(venta: any): number {
    if (!venta.detalles || !Array.isArray(venta.detalles)) {
      return 0;
    }

  return venta.detalles.filter((item: any) => item.estado_envio.toLowerCase() !== 'cancelado' && item.estado_envio.toLowerCase() !== 'reembolsado')
    .reduce((total: number, detalle: any) => {
      return total + (detalle.cantidad * detalle.subtotal);
    }, 0);
  }

  cancelarVenta(detalle: any) {
    this.ionicService.mostrarAlertaConfirmacion('Cancelar producto', '¿Estás seguro que deseas cancelar este producto del pedido?',
    () => this.crudService.cancelarPedido(detalle.pedido_id, detalle.producto_id) );    
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
