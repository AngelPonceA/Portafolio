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

  constructor(private ubicacionService: UbicacionService) { }

  calcularCostoEnvioProducto(producto: Producto, direccionDestino: Direccion, cantidad: number = 1): number {
    const regionOrigenNombre = producto.direccionOrigen?.region;
    const regionDestinoNombre = direccionDestino?.region;
    

    if (!regionOrigenNombre || !regionDestinoNombre) {
      return 6000; // si no hay datos, costo fijo
    }

    const regionOrigen = this.ubicacionService.buscarRegionPorNombre(regionOrigenNombre);
    const regionDestino = this.ubicacionService.buscarRegionPorNombre(regionDestinoNombre);

    if (!regionOrigen || !regionDestino) {
      return 6000; // si no hay datos, costo fijo
    }

    const diferenciaIds = Math.abs(regionOrigen.id - regionDestino.id);
    const costo = this.BASE_ENVIO + (diferenciaIds * this.MULTIPLICADOR);

    return costo * cantidad;

  }
}
