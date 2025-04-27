import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, of, switchMap } from 'rxjs';
import { Producto } from '../../models/producto.models';
import { Variante } from '../../models/variante.models';
import { Oferta } from 'src/app/models/oferta.models';
import { ProductoExtendido } from 'src/app/models/producto_ext.models';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private firestore: Firestore, private nativeStorage: NativeStorage) {}
  
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

  obtenerDetalleVariante(variante_id: string) {
    const varianteRef = doc(this.firestore, 'variantes', variante_id);
    return from(getDoc(varianteRef)).pipe(
      switchMap(async (varianteSnap) => {
        if (!varianteSnap.exists()) return null;

        const variante = varianteSnap.data();
        const productoSnap = await getDoc(doc(this.firestore, 'productos', variante['producto_id']));
        if (!productoSnap.exists()) return null;

        const producto = productoSnap.data();
        const ofertaSnap = await getDocs(query(
          collection(this.firestore, 'ofertas'),
          where('variante_id', '==', variante_id)
        ));

        let precio_oferta = null;
        if (!ofertaSnap.empty) {
          ofertaSnap.forEach(doc => {
            const oferta = doc.data();
            const now = new Date();
            if (now >= oferta['fecha_inicio'].toDate() && now <= oferta['fecha_fin'].toDate()) {
              precio_oferta = oferta['precio_oferta'];
            }
          });
        }

        return {
          variante_id: variante_id,
          usuario_id: producto['usuario_id'],
          precio: variante['precio'],
          precio_oferta,
          imagen: variante['imagen'],
          producto_titulo: producto['titulo'],
          producto_descripcion: producto['descripcion'],
          etiquetas: producto['etiquetas'] || [],
        };
      })
    );
  }
  
  obtenerFavoritosConDetalles() {
    // const uid = this.nativeStorage.getItem('id');
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const favoritosRef = collection(this.firestore, 'favoritos');
    const q = query(favoritosRef, where('usuario_id', '==', uid));
  
    return collectionData(q, { idField: 'id' }).pipe(
      switchMap(favoritos => {
        if (favoritos.length === 0) return of([]);
  
        const detalles$ = favoritos.map(async favorito => {
          const varianteSnap = await getDoc(doc(this.firestore, 'variantes', favorito['variante_id']));
          const productoSnap = await getDoc(doc(this.firestore, 'productos', varianteSnap.data()?.['producto_id']));
  
          if (!varianteSnap.exists() || !productoSnap.exists()) return null;
  
          const variante = varianteSnap.data();
          const producto = productoSnap.data();
  
          const ofertaSnap = await getDocs(query(collection(this.firestore, 'ofertas'), where('variante_id', '==', favorito['variante_id'])));
          let precio_oferta = null;
  
          if (!ofertaSnap.empty) {
            ofertaSnap.forEach(doc => {
              const oferta = doc.data();
              const currentDate = new Date();
              if (currentDate >= oferta['fecha_inicio'].toDate() && currentDate <= oferta['fecha_fin'].toDate()) {
                precio_oferta = oferta['precio_oferta'];
              }
            });
          }
  
          return {
            variante_id: favorito['variante_id'],
            precio: variante['precio'],
            precio_oferta,
            imagen: variante['imagen'],
            producto_titulo: producto['titulo'],
            favorito_id: favorito['id'],
          };
        });
  
        return from(Promise.all(detalles$));
      })
    );
  }

  async obtenerFavoritoId(variante_id: string) {
    try {
      // const uid = this.nativeStorage.getItem('id');
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
      const favoritosRef = collection(this.firestore, 'favoritos');
      const q = query(
        favoritosRef,
        where('usuario_id', '==', uid),
        where('variante_id', '==', variante_id)
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener el ID del favorito:', error);
      return null;
    }
  }

  async eliminarFavorito(favorito_id: string) {
    try {
      const favoritoRef = doc(this.firestore, 'favoritos', favorito_id);
      await deleteDoc(favoritoRef);
    } catch (error) {
      console.error('Error al eliminar el favorito:', error);
      throw error;
    }
  }

  async agregarFavorito(variante_id: string) {
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    // const uid = await this.nativeStorage.getItem('id');
    const favoritosRef = collection(this.firestore, 'favoritos');
    const nuevoFavoritoRef = doc(favoritosRef);
    const nuevoFavorito = {
      usuario_id: uid,
      variante_id: variante_id,
    };
    await setDoc(nuevoFavoritoRef, nuevoFavorito);
  }

  async esFavorito(variante_id: string) {
    try {
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
      // const uid = await this.nativeStorage.getItem('id');
      const favoritosRef = collection(this.firestore, 'favoritos');
      const q = query(favoritosRef, where('usuario_id', '==', uid), where('variante_id', '==', variante_id));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty; 
      
    } catch (error) {
      console.error('Error al comprobar si el producto es favorito:', error);
      return false;
    }
  }

}
