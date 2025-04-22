import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc } from '@angular/fire/firestore';
import { combineLatest, map, Observable } from 'rxjs';
import { Producto } from '../../models/producto.models';
import { Variante } from '../../models/variante.models';
import { Oferta } from 'src/app/models/oferta.models';
import { ProductoExtendido } from 'src/app/models/producto_ext.models';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private firestore: Firestore) {}

  async obtenerContactoID(uid: string): Promise<number | undefined> {
    const ref = doc(this.firestore, `usuarios/${uid}`);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      let data = snap.data();
      return data['telefono'].replace(/[^\d]/g, '');
    }
    return undefined;
  }
  
  obtenerTodosLosProductos(): Observable<Producto[]> {
    const productosRef = collection(this.firestore, 'productos');
    return collectionData(productosRef, { idField: 'id' }) as Observable<Producto[]>;
  }

  obtenerVariantes(): Observable<Variante[]> {
    const variantesRef = collection(this.firestore, 'variantes');
    return collectionData(variantesRef, { idField: 'id' }) as Observable<Variante[]>;
  }

  obtenerOfertas(): Observable<Oferta[]> {
    const ofertaRef = collection(this.firestore, 'ofertas');
    return collectionData(ofertaRef, { idField: 'id' }) as Observable<Oferta[]>;
  }

  obtenerProductosConStock(): Observable<Producto[]> {
    return combineLatest([
      this.obtenerTodosLosProductos(),
      this.obtenerVariantes()
    ]).pipe(
      map(([productos, variantes]) => {
        const productosConStock = productos.filter(producto => {
          return variantes.some(v => v.producto_id === producto.id && v.stock > 0);
        });
        return productosConStock;
      })
    );
  }

  obtenerProductosConVarianteYOferta(): Observable<ProductoExtendido[]> {
    return combineLatest([
      this.obtenerTodosLosProductos(),
      this.obtenerVariantes(),
      this.obtenerOfertas()
    ]).pipe(
      map(([productos, variantes, ofertas]) => {
        return productos.reduce((acumulador, producto) => {
          const variantesDelProducto = variantes.filter(v => v.producto_id === producto.id && v.stock > 0);
  
          const items = variantesDelProducto.map(variante => {
            const oferta = ofertas.find(o => o.variante_id === variante.id);
            return { producto, variante, oferta };
          });
  
          return acumulador.concat(items);
        }, [] as ProductoExtendido[]);
      })
    );
  }

  obtenerProductosSinOferta(): Observable<any[]> {
    return this.obtenerProductosConVarianteYOferta().pipe(
      map((productosExtendidos) => {
        // Filtrar productos que no tienen oferta activa
        return productosExtendidos.filter(item => !item.oferta || item.oferta.precio_oferta === 0);
      })
    );
  }

  obtenerProductosConOferta(): Observable<any[]> {
    return this.obtenerProductosConVarianteYOferta().pipe(
      map((productosExtendidos) => {
        // Filtrar productos que tienen una oferta activa
        return productosExtendidos.filter(item => item.oferta && item.oferta.precio_oferta > 0);
      })
    );
  }
  
  
}
