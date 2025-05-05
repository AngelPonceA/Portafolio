import { Categoria } from './../../models/categoria.models';
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { combineLatest, firstValueFrom, from, map, mergeMap, Observable, of, switchMap } from 'rxjs';
import { Producto } from '../../models/producto.models';
import { Variante } from '../../models/variante.models';
import { Oferta } from 'src/app/models/oferta.models';
import { ProductoExtendido, ProductoExtendidoPorProducto } from 'src/app/models/producto_ext.models';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor(private firestore: Firestore, private nativeStorage: NativeStorage) {}
  
  obtenerProductos(): Observable<Producto[]> {
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

  obtenerCategorias() {
    const categoriaRef = collection(this.firestore, 'categorias');
    return collectionData(categoriaRef, { idField: 'id' }) as Observable<Categoria[]>;
  }
  
  async obtenerDocumentoPorId(coleccion: string, id: string): Promise<any> {
    try {
      const docRef = doc(this.firestore, coleccion, id);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        console.error(`El documento con ID ${id} no existe en la colección ${coleccion}.`);
        return null;
      }
  
      return docSnap.data();
    } catch (error) {
      console.error(`Error al obtener el documento de ${coleccion}:`, error);
      return null;
    }
  }

  obtenerProductosConStock(): Observable<Producto[]> {
    return combineLatest([
      this.obtenerProductos(),
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
      this.obtenerProductos(),
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

  obtenerProductosCategoria(categoria: string): Observable<any[]> {
    return this.obtenerProductosConVarianteYOferta().pipe(
      map((productosExtendidos) => {
        return productosExtendidos.filter(item => item.producto.categoria == categoria);
      })
    );
  }

  obtenerProductosSinOferta(): Observable<any[]> {
    return this.obtenerProductosConVarianteYOferta().pipe(
      map((productosExtendidos) => {
        const now = new Date();
        return productosExtendidos.filter(item => !item.oferta || now < item.oferta.fecha_inicio.toDate() || now > item.oferta.fecha_fin.toDate() );
      })
    );
  }

  obtenerProductosConOferta(): Observable<any[]> {
    return this.obtenerProductosConVarianteYOferta().pipe(
      map((productosExtendidos) => {
        const now = new Date();
        return productosExtendidos.filter(item => item.oferta && now >= item.oferta.fecha_inicio.toDate() && now <= item.oferta.fecha_fin.toDate());
      })
    );
  }

  async obtenerDetalleVariante(variante_id: string) {
    try {
      const varianteRef = doc(this.firestore, 'variantes', variante_id);
      const varianteSnap = await getDoc(varianteRef);

      if (!varianteSnap.exists()) {
        console.error(`La variante con ID ${variante_id} no existe.`);
        return null;
      }

      const variante = varianteSnap.data();

      const productoRef = doc(this.firestore, 'productos', variante['producto_id']);
      const productoSnap = await getDoc(productoRef);

      if (!productoSnap.exists()) {
        console.error(`El producto relacionado con la variante ${variante_id} no existe.`);
        return null;
      }

      const producto = productoSnap.data();

      const ofertaQuery = query(
        collection(this.firestore, 'ofertas'),
        where('variante_id', '==', variante_id)
      );
      const ofertaSnap = await getDocs(ofertaQuery);

      let precio_oferta = null;

      if (!ofertaSnap.empty) {
        ofertaSnap.forEach((doc) => {
          const oferta = doc.data();
          const now = new Date();

          if (now >= oferta['fecha_inicio'].toDate() && now <= oferta['fecha_fin'].toDate()) {
            precio_oferta = oferta['precio_oferta'];
          }
        });
      }

      return {
        variante_id: variante_id,
        producto_id: variante['producto_id'],
        vendedor_id: producto['usuario_id'],
        producto_titulo: producto['titulo'],
        producto_descripcion: producto['descripcion'],
        etiquetas: producto['etiquetas'] || [],
        categoria: producto['categoria'],
        precio: variante['precio'],
        precio_oferta: precio_oferta,
        stock: variante['stock'],
        estado: variante['estado'],
        atributo: variante['atributo'],
        imagen: variante['imagen'],
      };

    } catch (error) {
      console.error('Error al obtener los detalles de la variante:', error);
      return null;
    }
  }

  obtenerFavoritosConDetalles() {
      // const { id: uid } = await this.nativeStorage.getItem(this.usuarioStorage);
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
      // const { id: uid } = await this.nativeStorage.getItem(this.usuarioStorage);
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
    // const { id: uid } = await this.nativeStorage.getItem(this.usuarioStorage);
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
      // const { id: uid } = await this.nativeStorage.getItem(this.usuarioStorage);
      const favoritosRef = collection(this.firestore, 'favoritos');
      const q = query(favoritosRef, where('usuario_id', '==', uid), where('variante_id', '==', variante_id));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty; 
      
    } catch (error) {
      console.error('Error al comprobar si el producto es favorito:', error);
      return false;
    }
  }

  // ========================== Página mis-productos ==========================

  // Métodos de clase producto
  obtenerMisProductos(): Observable<Producto[]> {
    // const uid = this.nativeStorage.getItem('id');
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const productosRef = collection(this.firestore, 'productos');
    const q = query(productosRef, where('usuario_id', '==', uid));
    return collectionData(q, { idField: 'id' }) as Observable<Producto[]>;
  }

  async eliminarProducto(producto_id: string) {
    try {
      const productoRef = doc(this.firestore, 'productos', producto_id);
      await deleteDoc(productoRef);
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      throw error;
    }
  }

  async guardarProducto(producto: Producto) {
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    // const uid = await this.nativeStorage.getItem('id');
    const productosRef = collection(this.firestore, 'productos');
    const nuevoProductoRef = doc(productosRef);
    const nuevoProducto = {
      ...producto,
      usuario_id: uid,
      id: nuevoProductoRef.id,
    };
    await setDoc(nuevoProductoRef, nuevoProducto);
    return nuevoProducto;
  }

  async editarProducto(producto_id: string, producto: Producto) {
    const productoRef = doc(this.firestore, 'productos', producto_id);
    await setDoc(productoRef, producto, { merge: true });
  }

  // Métodos de clase variante
  obtenerVariantesPorProducto(producto_id: string): Observable<Variante[]> {
    const variantesRef = collection(this.firestore, 'variantes');
    const q = query(variantesRef, where('producto_id', '==', producto_id));
    return collectionData(q, { idField: 'id' }) as Observable<Variante[]>;
  }

  async eliminarVariante(variante_id: string) {
    try {
      const varianteRef = doc(this.firestore, 'variantes', variante_id);
      await deleteDoc(varianteRef);
    } catch (error) {
      console.error('Error al eliminar la variante:', error);
      throw error;
    }
  }

  async eliminarVariantesPorProducto(producto_id: string): Promise<Variante[]> {
    try {
      const variantes = await firstValueFrom(
        this.obtenerVariantesPorProducto(producto_id)
      );

      if (variantes && variantes.length > 0) {
        const eliminarPromises = variantes.map((variante) =>
          this.eliminarVariante(variante.id)
        );
        await Promise.all(eliminarPromises);
        console.log(
          `Se eliminaron ${variantes.length} variantes del producto con ID: ${producto_id}`
        );
      } else {
        console.log(
          `No se encontraron variantes para el producto con ID: ${producto_id}`
        );
      }
      return variantes;
    } catch (error) {
      console.error(
        `Error al eliminar las variantes del producto con ID: ${producto_id}`,
        error
      );
      throw error;
    }
  }

  async guardarVariante(variante: Variante) {
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    // const uid = await this.nativeStorage.getItem('id');
    const variantesRef = collection(this.firestore, 'variantes');
    const nuevaVarianteRef = doc(variantesRef);
    const nuevaVariante = {
      ...variante,
      usuario_id: uid,
      id: nuevaVarianteRef.id,
    };
    await setDoc(nuevaVarianteRef, nuevaVariante);
    return nuevaVariante;
  }

  async editarVariante(variante_id: string, variante: Variante) {
    const varianteRef = doc(this.firestore, 'variantes', variante_id);
    await setDoc(varianteRef, variante, { merge: true });
  }

  // Métodos de clase oferta
  async obtenerOfertaPorVariante(variante_id: string): Promise<Oferta[]> {
    const ofertasRef = collection(this.firestore, 'ofertas');
    const q = query(ofertasRef, where('variante_id', '==', variante_id));
    const querySnapshot = await getDocs(q);
    const ofertas: Oferta[] = [];
    querySnapshot.forEach((doc) => {
      ofertas.push({ id: doc.id, ...doc.data() } as Oferta);
    });
    return ofertas;
  }

  async eliminarOferta(oferta_id: string) {
    try {
      const ofertaRef = doc(this.firestore, 'ofertas', oferta_id);
      await deleteDoc(ofertaRef);
    } catch (error) {
      console.error('Error al eliminar la oferta:', error);
      throw error;
    }
  }

  obtenerOfertasPorVariante(variante_id: string): Observable<Oferta[]> {
    const ofertasRef = collection(this.firestore, 'ofertas');
    const q = query(ofertasRef, where('variante_id', '==', variante_id));
    return collectionData(q, { idField: 'id' }) as Observable<Oferta[]>;
  }

  async eliminarOfertasPorVariante(variante_id: string): Promise<void> {
    try {
      const ofertas = await firstValueFrom(
        this.obtenerOfertasPorVariante(variante_id)
      );

      if (ofertas && ofertas.length > 0) {
        const eliminarPromises = ofertas.map((oferta) =>
          this.eliminarOferta(oferta.id)
        );
        await Promise.all(eliminarPromises);
        console.log(
          `Se eliminaron ${ofertas.length} ofertas de la variante con ID: ${variante_id}`
        );
      } else {
        console.log(
          `No se encontraron ofertas para la variante con ID: ${variante_id}`
        );
      }
    } catch (error) {
      console.error(
        `Error al eliminar las ofertas de la variante con ID: ${variante_id}`,
        error
      );
      throw error;
    }
  }

  async guardarOferta(oferta: Oferta) {
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    // const uid = await this.nativeStorage.getItem('id');
    const ofertasRef = collection(this.firestore, 'ofertas');
    const nuevaOfertaRef = doc(ofertasRef);
    const nuevaOferta = {
      ...oferta,
      usuario_id: uid,
      id: nuevaOfertaRef.id,
    };
    await setDoc(nuevaOfertaRef, nuevaOferta);
    return nuevaOferta;
  }

  async editarOferta(oferta_id: string, oferta: Oferta) {
    const ofertaRef = doc(this.firestore, 'ofertas', oferta_id);
    await setDoc(ofertaRef, oferta, { merge: true });
  }

  // Métodos de clase categoria
  obtenerCategoriasDB(): Observable<any[]> {
    const categoriasRef = collection(this.firestore, 'categorias');
    return collectionData(categoriasRef, { idField: 'id' }) as Observable<
      any[]
    >;
  }

  async eliminarCategoria(categoria_id: string) {
    try {
      const categoriaRef = doc(this.firestore, 'categorias', categoria_id);
      await deleteDoc(categoriaRef);
    } catch (error) {
      console.error('Error al eliminar la categoria:', error);
      throw error;
    }
  }

  async guardarCategoria(categoria: Categoria) {
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    // const uid = await this.nativeStorage.getItem('id');
    const categoriasRef = collection(this.firestore, 'categorias');
    const nuevaCategoriaRef = doc(categoriasRef);
    const nuevaCategoria = {
      ...categoria,
      usuario_id: uid,
      id: nuevaCategoriaRef.id,
    };
    await setDoc(nuevaCategoriaRef, nuevaCategoria);
  }

  async editarCategoria(categoria_id: string, categoria: Categoria) {
    const categoriaRef = doc(this.firestore, 'categorias', categoria_id);
    await setDoc(categoriaRef, categoria, { merge: true });
  }

  obtenerProductoExtendidoDeUsuario(): Observable<
    ProductoExtendidoPorProducto[]
  > {
    const productos = this.obtenerMisProductos();
    const variantes: Observable<Variante[]> = productos.pipe(
      mergeMap((productos) => from(productos)),
      mergeMap((producto) => this.obtenerVariantesPorProducto(producto.id))
    );
    const ofertas: Observable<Oferta[]> = variantes.pipe(
      mergeMap((variantes) => from(variantes)),
      mergeMap((variante) => this.obtenerOfertaPorVariante(variante.id))
    );
    return combineLatest([productos, variantes, ofertas]).pipe(
      map(([productos, variantes, ofertas]) => {
        return productos.map((p) => {
          const variantesDelProducto = variantes.filter(
            (v) => v.producto_id === p.id
          );
          const idOfertasDeVariantes = variantesDelProducto.map(
            (v) => v.oferta_id
          );
          const ofertasDeVariantes = ofertas.filter((o) =>
            idOfertasDeVariantes.includes(o.id)
          );
          return {
            producto: p,
            variantes: variantesDelProducto,
            ofertas: ofertasDeVariantes,
          };
        });
      })
    );
  }
}
