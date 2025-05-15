import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, from, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChilexpressService {
  private readonly PESO_BASE = 0.5; // Peso base por producto en kg
  private readonly DIMENSIONES_BASE = {
    alto: 10,
    ancho: 10,
    largo: 10
  };

  constructor(private http: HttpClient) {}

  async calcularCostoEnvio(productos: any[], comunaDestino: string) {
    try {
      // Calcular peso total y dimensiones
      const { pesoTotal, dimensiones } = this.calcularPesoYDimensiones(productos);

      // Obtener cotización de Chilexpress
      const cotizacion = await firstValueFrom(this.cotizarEnvio({
        originCountyCode: 'STGO', // Comuna origen por defecto
        destinationCountyCode: comunaDestino,
        package: {
          weight: pesoTotal.toString(),
          height: dimensiones.alto.toString(),
          width: dimensiones.ancho.toString(),
          length: dimensiones.largo.toString()
        },
        productType: 3, 
        declaredWorth: this.calcularValorDeclarado(productos).toString()
      }));

      
      return this.obtenerServicioMasEconomico(cotizacion);
    } catch (error) {
      console.error('Error al calcular costo de envío:', error);
      return 0;
    }
  }

  private calcularPesoYDimensiones(productos: any[]) {
    let pesoTotal = 0;
    let volumenTotal = 0;

    // Calcular peso y volumen total
    productos.forEach(producto => {
      const pesoPorProducto = this.PESO_BASE * producto.cantidad;
      pesoTotal += pesoPorProducto;

      const volumenPorProducto = this.DIMENSIONES_BASE.alto * 
                                this.DIMENSIONES_BASE.ancho * 
                                this.DIMENSIONES_BASE.largo * 
                                producto.cantidad;
      volumenTotal += volumenPorProducto;
    });

    // Calcular dimensiones equivalentes para el volumen total
    const dimensionCubica = Math.cbrt(volumenTotal);
    
    return {
      pesoTotal: Math.max(1, Math.ceil(pesoTotal)), // Mínimo 1 kg
      dimensiones: {
        alto: Math.ceil(dimensionCubica),
        ancho: Math.ceil(dimensionCubica),
        largo: Math.ceil(dimensionCubica)
      }
    };
  }

  private calcularValorDeclarado(productos: any[]): number {
    return productos.reduce((total, producto) => {
      const precio = producto.precio_oferta || producto.precio;
      return total + (precio * producto.cantidad);
    }, 0);
  }

  private cotizarEnvio(data: any): Observable<any> {
    return this.http.post(
      `${environment.chilexpress.urls.cotizador}/api/v1.0/rates/courier`,
      data
    );
  }

  private obtenerServicioMasEconomico(cotizacion: any): number {
    if (!cotizacion?.data?.courierServiceOptions?.length) {
      return 0;
    }

    return Math.min(
      ...cotizacion.data.courierServiceOptions.map(
        (option: any) => parseFloat(option.serviceValue)
      )
    );
  }
}
