import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-historial-compra',
  templateUrl: './historial-compra.page.html',
  styleUrls: ['./historial-compra.page.scss'],
  standalone: false
})

export class HistorialCompraPage implements OnInit {
  
  historialCompra?: any[] | undefined;

  detalleSeleccionado: any = null;

  constructor(private router: Router, private navCtrl: NavController, private crudService: CrudService) {}

  async ngOnInit() {

    const lista = await this.crudService.obtenerHistorialCompra();
    this.historialCompra = Array.isArray(lista) ? lista : [];

  }

  volverAtras() {
    this.navCtrl.back();
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

}
