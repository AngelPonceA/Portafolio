import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud/crud.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';
import * as QRCode from 'qrcode';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Component({
  selector: 'app-historial-ventas',
  templateUrl: './historial-ventas.page.html',
  styleUrls: ['./historial-ventas.page.scss'],
  standalone: false
})
export class HistorialVentasPage implements OnInit {

  historialVentas?: any[] | undefined;

  detalleSeleccionado: any = null;

  qrGenerado: string = '';

  constructor(private router: Router, 
              private crudService: CrudService, 
              private navCtrl: NavController,
              private ionicService: IonicService ) {}

  async ngOnInit() {
    await this.ionicService.mostrarCargando('Cargando historial...');

    try {
      const lista = await this.crudService.obtenerHistorialVentas();
      this.historialVentas = Array.isArray(lista) ? lista : [];
    } catch (error) {
      console.error('Error al cargar historial de ventas:', error);
    } finally {
      await this.ionicService.ocultarCargando();
    }
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

  async generarYMostrarQR(venta: any) {
    const direccion = `${venta.nombres} ${venta.apellidos}, ${venta.calle} ${venta.numero}, ${venta.comuna}, ${venta.region}`;
    this.qrGenerado = await this.generarQR(direccion);
  }

  async generarQR(direccion: string): Promise<string> {
    try {
      const qrDataURL = await QRCode.toDataURL(direccion, {
        width: 256,
        margin: 1,
      });
      return qrDataURL;
    } catch (err) {
      console.error('Error generando QR:', err);
      return '';
    }
  }

  async descargarQR(venta: any) {
    const direccionTexto = `
  ${venta.nombres || ''} ${venta.apellidos || ''}
  ${venta.calle || ''} #${venta.numero || ''} ${venta.departamento || ''}
  ${venta.comuna || ''}, ${venta.region || ''}
  Tel: ${venta.telefono || ''}
    `.trim();

    await this.ionicService.mostrarCargando('Generando QR...');

    try {
      const qrDataURL = await this.generarQR(direccionTexto);

      if (!qrDataURL) throw new Error('QR vacío');

      // Extraer solo el base64 sin el encabezado "data:image/png;base64,"
      const base64Data = qrDataURL.split(',')[1];

      const filename = `qr-envio-${venta.fecha_creacion?.seconds || Date.now()}.png`;

      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
      });

      await this.ionicService.ocultarCargando();
      this.ionicService.mostrarToastAbajo('QR guardado correctamente en Archivos/Documentos');
    } catch (error) {
      console.error('Error al guardar QR:', error);
      await this.ionicService.ocultarCargando();
      this.ionicService.mostrarToastAbajo('Error al guardar el QR');
    }
  }

  mostrarInstruccionesEnvio() {
    this.ionicService.mostrarAlerta(
      'Instrucciones de Envío',
      `Primero, empaqueta bien el producto en una caja o bolsa de burbujas. Luego, descarga el código QR y pégalo en la caja. Después, lleva el paquete a una sucursal de la empresa de envío. Finalmente, asegúrate de realizar el envío dentro del plazo de 3 a 7 días hábiles.`
    );
  }

}
