import { Oferta } from './oferta.models';
import { Producto } from './producto.models';
import { Variante } from './variante.models';

export interface ProductoExtendido {
  producto: Producto;
  variante: Variante;
  oferta?: Oferta;
}

export interface ProductoExtendidoPorProducto {
  producto: Producto;
  variantes: Variante[];
  ofertas?: Oferta[];
}
