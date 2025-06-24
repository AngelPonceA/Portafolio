import { Injectable } from '@angular/core';
import { Producto } from 'src/app/models/producto.models';
import { Direccion } from 'src/app/models/direccion.models';
import { UbicacionService } from '../ubicacion/ubicacion.service';

@Injectable({
  providedIn: 'root'
})
export class CostoDeEnvioService {
  private readonly BASE_ENVIO = 3000;
  private readonly MULTIPLICADOR = 1000;

  constructor(private ubicacionService: UbicacionService) {}

  calcularTotalEnvio(items: { producto: Producto, cantidad: number }[], direccionDestino: Direccion): number {
    let total = 0;

    for (const item of items) {
      const { producto, cantidad } = item;
      const regionOrigen = producto.direccionOrigen?.region;
      const regionDestino = direccionDestino?.region;

      if (!regionOrigen || !regionDestino) continue;

      const origen = this.ubicacionService.buscarRegionPorNombre(regionOrigen);
      const destino = this.ubicacionService.buscarRegionPorNombre(regionDestino);

      if (!origen || !destino) continue;

      const diferencia = Math.abs(origen.id - destino.id);
      const costo = (this.BASE_ENVIO + (diferencia * this.MULTIPLICADOR)) * cantidad;

      total += costo;
    }

    return total;
  }

  logEnvio(items: { producto: Producto, cantidad: number }[], direccionDestino: Direccion): void {
    for (const item of items) {
      const { producto, cantidad } = item;
      const regionOrigen = producto.direccionOrigen?.region;
      const regionDestino = direccionDestino?.region;

      if (!regionOrigen || !regionDestino) continue;

      const origen = this.ubicacionService.buscarRegionPorNombre(regionOrigen);
      const destino = this.ubicacionService.buscarRegionPorNombre(regionDestino);

      if (!origen || !destino) continue;

      const diferencia = Math.abs(origen.id - destino.id);
      const costo = (this.BASE_ENVIO + (diferencia * this.MULTIPLICADOR)) * cantidad;

      console.log(`[${producto.titulo}] ${regionOrigen} ➜ ${regionDestino} x${cantidad} → $${costo}`);
    }
  }
}
