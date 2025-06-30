import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud/crud.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import { ModalBoletaComponent } from 'src/app/components/modal-boleta/modal-boleta.component';

@Component({
  selector: 'app-historial-compra',
  templateUrl: './historial-compra.page.html',
  styleUrls: ['./historial-compra.page.scss'],
  standalone: false
})

export class HistorialCompraPage implements OnInit {
  
  historialCompra?: any[] | undefined;

  detalleSeleccionado: any = null;

  constructor(private router: Router, 
              private navCtrl: NavController,
              private crudService: CrudService, 
              private ionicService: IonicService,
              private modalCtrl: ModalController) {}
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

  async solicitarDevolucion(detalle: any, tipo: 'arrepentimiento' | 'defectuoso') {
    const mensajeArrepentimiento = `Para devolver por arrepentimiento: Por favor envíe el producto a nuestro centro logistico 
    Sucursal principal: Av. Siempre Viva 742, Santiago, Chile con tu código de seguimiento: ${detalle.numero_seguimiento}, 
    el envío debe ser realizado por ti, una vez recibido, procesaremos tu reembolso.`;

    const mensajeDefectuoso = `Para productos defectuosos: Por favor envíe el producto a nuestro centro logistico 
    Sucursal principal: Av. Siempre Viva 742, Santiago, Chile, con tu código de seguimiento: ${detalle.numero_seguimiento}, 
    el envío debe ser realizado por ti, nuestro equipo revisará el producto y reembolsará el dinero a su 
    tarjeta de ser valido el reembolso.`;

    const mensaje = tipo === 'arrepentimiento' ? mensajeArrepentimiento : mensajeDefectuoso;

    const confirmado = await this.ionicService.mostrarAlertaConfirmacion('Confirmar devolución', mensaje,
      async () => {
        await this.crudService.solicitarDevolucionProducto(detalle.pedido_id, detalle.producto_id, tipo);
      }
    );    
  }

  CalcularDiasDiferencia() {
    const fechaRec = this.detalleSeleccionado.fecha_recepcion?.toDate?.();
    if (!fechaRec) return Infinity;
    const hoy = new Date();
    const diffMs = hoy.getTime() - fechaRec.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  cancelarCompra(detalle: any) {
    this.ionicService.mostrarAlertaConfirmacion('Cancelar producto', '¿Estás seguro que deseas cancelar este producto del pedido?',
    () => this.crudService.cancelarPedido(detalle.pedido_id, detalle.producto_id) );    
  }

  verProducto(producto_id: string){
    this.detalleSeleccionado = null;
    setTimeout(() => {
      this.router.navigate(['/producto'], { state: { producto_id } });
    }, 100);
  }

async abrirModalBoleta(pedido: any) {
  const boleta = await this.crudService.recuperarBoletaConOrdenCompra(pedido.detalles_pago.buy_order);

  if (!boleta) {
    this.ionicService.mostrarAlerta('Error', 'No se encontró la boleta para este pedido.');
    return;
  }

  const modal = await this.modalCtrl.create({
    component: ModalBoletaComponent,
    componentProps: {
      detalleBoleta: boleta
    },
    cssClass: 'modal-boleta-clase'
  });

  await modal.present();
}


}
