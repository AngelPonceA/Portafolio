import { Categoria } from './../../models/categoria.models';
import { inject, Injectable, Injector } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, collection, collectionData, deleteDoc, doc, getDoc, getDocs, query, setDoc, where, updateDoc, orderBy, onSnapshot, addDoc, serverTimestamp, CollectionReference } from '@angular/fire/firestore';
import { combineLatest, firstValueFrom, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { Producto } from '../../models/producto.models';
import { Oferta } from 'src/app/models/oferta.models';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { IonicService } from "src/app/services/ionic/ionic.service";
import { AuthService } from '../auth/auth.service';
import { Calificacion } from 'src/app/models/calificacion.models';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  constructor( private firestore: Firestore, private nativeStorage: NativeStorage, private ionicService: IonicService ) {}

  private injector = inject(Injector);
  private _authService?: AuthService;

  get authService(): AuthService {
    if (!this._authService) {
      this._authService = this.injector.get(AuthService);
    }
    return this._authService;
  }

  obtenerProductos(): Observable<Producto[]> {
    const productosRef = collection(this.firestore, 'productos');
    return collectionData(productosRef, { idField: 'id' }) as Observable<Producto[]>;
  }

  obtenerOfertas(): Observable<Oferta[]> {
    const ofertaRef = collection(this.firestore, 'ofertas');
    return collectionData(ofertaRef, { idField: 'id' }) as Observable<Oferta[]>;
  }

  obtenerCalificacionesProducto(): Observable<Calificacion[]> {
    const calificacionRef = collection(this.firestore, 'calificaciones');
    return collectionData(calificacionRef, { idField: 'id' }) as Observable<Calificacion[]>;
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

  obtenerProductosYOferta(): Observable<Producto[]> {
    return combineLatest([
      this.obtenerProductos(),
      this.obtenerOfertas(),
      this.obtenerCalificacionesProducto()
    ]).pipe(
      switchMap(([productos, ofertas, calificaciones]) => {
        const productosLista = productos.filter(p => p.stock > 0 && !p.esta_eliminado);

        const promesas = productosLista.map(async producto => {
          const oferta = ofertas.find(o => o.producto_id === producto.producto_id);
          const calificacion = calificaciones.find(c => c.producto_id === producto.producto_id);

          let lista = { ...producto };

          if (oferta) {
            lista = { ...lista, oferta };
          }

          if (calificacion) {
            const promedio = await this.obtenerPromedioCalificacionProducto(calificacion.producto_id);
            lista = { ...lista, calificacion: promedio };
          }

          return lista;
        });

        return forkJoin(promesas.map(p => from(p)));
      })
    );
  }

  buscarProductosPorNombre(nombre: string): Observable<Producto[]> {
    return this.obtenerProductosYOferta().pipe(
      map(productos =>
        productos.filter(producto =>
          producto.titulo.toLowerCase().includes(nombre.toLowerCase())
        )
      )
    );
  }

  obtenerProductosCategoria(categoria: string): Observable<Producto[]> {
    return this.obtenerProductosYOferta().pipe(
      map((productos) => productos.filter(item => item.categoria == categoria))
    );
  }

  obtenerProductosRecomendados(): Observable<Producto[]> {
    return from(this.authService.obtenerSesion()).pipe(
      switchMap(sesion => {
        const uid = sesion.id;
        const usuarioRef = doc(this.firestore, 'usuarios', uid);
        return from(getDoc(usuarioRef)).pipe(
          switchMap(usuarioSnap => {
            if (!usuarioSnap.exists()) {
              return of([]);
            }
            const usuario = usuarioSnap.data();
            const etiquetas = (usuario['recomendacion'] || []).map((e: string) => e.toLowerCase());
            if (!etiquetas.length) {
              return of([]);
            }
            return this.obtenerProductosYOferta().pipe(
              map(productos =>
                productos.filter(
                  producto =>
                    Array.isArray(producto.etiquetas) &&
                    producto.etiquetas.some((e: string) => etiquetas.includes(e.toLowerCase()))
                )
              )
            );
          })
        );
      })
    );
  }

  obtenerProductosSinOferta(): Observable<Producto[]> {
    return this.obtenerProductosYOferta().pipe(
      map((productos) => {
        const ahora = new Date();
        return productos.filter(item =>
          !item.oferta ||
          ahora < item.oferta.fecha_inicio.toDate() ||
          ahora > item.oferta.fecha_fin.toDate()
        );
      })
    );
  }

  obtenerProductosConOferta(): Observable<Producto[]> {
    return this.obtenerProductosYOferta().pipe(
      map((productos) => {
        const ahora = new Date();
        return productos.filter(item =>
          item.oferta &&
          ahora >= item.oferta.fecha_inicio.toDate() &&
          ahora <= item.oferta.fecha_fin.toDate()
        );
      })
    );
  }

  async obtenerDetalleProducto(producto_id: string) {
    try {
      const productoRef = doc(this.firestore, 'productos', producto_id);
      const productoSnap = await getDoc(productoRef);

      if (!productoSnap.exists()) {
        console.error(`El producto con ID ${producto_id} no existe.`);
        return null;
      }

      const producto = productoSnap.data();

      const ofertaQuery = query(
        collection(this.firestore, 'ofertas'),
        where('producto_id', '==', producto_id)
      );
      const ofertaSnap = await getDocs(ofertaQuery);

      let precio_oferta = null;

      if (!ofertaSnap.empty) {
        ofertaSnap.forEach((doc) => {
          const oferta = doc.data();
          const ahora = new Date();

          if (ahora >= oferta['fecha_inicio'].toDate() && ahora <= oferta['fecha_fin'].toDate()) {
            precio_oferta = oferta['precio_oferta'];
          }
        });
      }

      let promedioCalificaciones = this.obtenerPromedioCalificacionProducto(producto_id);

      return {
        producto_id: producto_id,
        vendedor_id: producto['usuario_id'],
        producto_titulo: producto['titulo'],
        producto_descripcion: producto['descripcion'],
        etiquetas: producto['etiquetas'] || [],
        categoria: producto['categoria'],
        calificacion: await promedioCalificaciones,
        esta_eliminado: producto['esta_eliminado'],
        precio: producto['precio'],
        precio_oferta: precio_oferta,
        stock: producto['stock'],
        estado: producto['estado'],
        atributo: producto['atributo'],
        imagen: producto['imagen'],
        direccionOrigen: producto['direccionOrigen'],
      };

    } catch (error) {
      console.error('Error al obtener los detalles del producto:', error);
      return null;
    }
  }

  obtenerProductosTienda(usuario_id: string): Observable<Producto[]> {
    return this.obtenerProductosYOferta().pipe(
      map(productos => productos.filter(producto => producto['usuario_id'] === usuario_id))
    );
  }

  obtenerFavoritosConDetalles(usuario_id: string) {
    const favoritosRef = collection(this.firestore, 'favoritos');
    const q = query(favoritosRef, where('usuario_id', '==', usuario_id));

    return collectionData(q, { idField: 'id' }).pipe(
      switchMap(favoritos => {
        if (favoritos.length === 0) return of([]);

        const detalles$ = favoritos.map(async favorito => {
          const productoSnap = await getDoc(doc(this.firestore, 'productos', favorito['producto_id']));
          if (!productoSnap.exists()) return null;
          const producto = productoSnap.data();

          const ofertaSnap = await getDocs(query(collection(this.firestore, 'ofertas'), where('producto_id', '==', favorito['producto_id'])));
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
            producto_id: favorito['producto_id'],
            precio: producto['precio'],
            precio_oferta,
            stock: producto['stock'],
            imagen: producto['imagen'],
            producto_titulo: producto['titulo'],
            favorito_id: favorito['id'],
          };
        });

        return from(Promise.all(detalles$));
      })
    );
  }

  async obtenerFavoritoId(producto_id: string) {
    try {
      const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
      const favoritosRef = collection(this.firestore, 'favoritos');
      const q = query(
        favoritosRef,
        where('usuario_id', '==', uid),
        where('producto_id', '==', producto_id)
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

  async agregarFavorito(producto_id: string) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const favoritosRef = collection(this.firestore, 'favoritos');
    const q = query(favoritosRef, where('usuario_id', '==', uid), where('producto_id', '==', producto_id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return;
    }

    const nuevoFavoritoRef = doc(favoritosRef);
    const nuevoFavorito = {
      usuario_id: uid,
      producto_id: producto_id,
    };
    await setDoc(nuevoFavoritoRef, nuevoFavorito);
  }

  async esFavorito(producto_id: string) {
    try {
      const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
      const favoritosRef = collection(this.firestore, 'favoritos');
      const q = query(favoritosRef, where('usuario_id', '==', uid), where('producto_id', '==', producto_id));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error al comprobar si el producto es favorito:', error);
      return false;
    }
  }

  async obtenerHistorialCompra() {
    try {
      const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
      const historialCompraRef = collection(this.firestore, 'pedidos');
      const q = query(historialCompraRef, where('usuario_id', '==', uid), orderBy('fecha_creacion', 'desc'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return [];
      }

      const historial = [];
      for (const pedidoDoc of querySnapshot.docs) {
        const pedidoData = pedidoDoc.data();
        const pedido_id = pedidoDoc.id;

        const detalleRef = collection(this.firestore, `pedidos/${pedido_id}/detalle`);
        const detalleSnapshot = await getDocs(detalleRef);

        const detalles = detalleSnapshot.docs.map(doc => doc.data());

        historial.push({ pedido_id, ...pedidoData, detalles });
      }
      
      return historial;
    } catch (error) {
      this.ionicService.mostrarAlerta('Error al obtener el historial de compra', 'error');
      return [];
    }
  }

  async obtenerHistorialVentas() {
    try {
      const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);
      const pedidosRef = collection(this.firestore, 'pedidos');
      const q = query(pedidosRef, orderBy('fecha_creacion', 'desc'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return [];
      }

      const historial = [];
      for (const pedidoDoc of querySnapshot.docs) {
        const pedidoData = pedidoDoc.data();
        const pedido_id = pedidoDoc.id;

        const detalleRef = collection(this.firestore, `pedidos/${pedido_id}/detalle`);
        const detalleSnapshot = await getDocs(detalleRef);

        const detalles = detalleSnapshot.docs
          .map(doc => doc.data())
          .filter(detalle => detalle['vendedor_id'] === uid);

        if (detalles.length > 0) {
          historial.push({ pedido_id, ...pedidoData, detalles });
        }
      }
      
      return historial;
    } catch (error) {
      this.ionicService.mostrarAlerta('Error al obtener el historial de ventas', 'error');
      return [];
    }
  }

  async obtenerVentasHistoricas() {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const ventasRef = collection(this.firestore, `ventas/${uid}/detalle`);
    const ventasSnapshot = await getDocs(ventasRef);

    const agrupadas: { [key: string]: { producto_id: string, anio: number, mes: number, cantidad: number } } = {};
    const productos = new Set<string>();
    const anios = new Set<number>();

    const anioActual = new Date().getFullYear();
    let hayDatosEnAnioActual = false;

    ventasSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const producto_id = data['producto_id'];
      const anio = data['fecha']?.anio;
      const mes = data['fecha']?.mes;
      const cantidad = data['cantidad'] || 0;
      if (!producto_id || !anio || !mes) return;

      productos.add(producto_id);
      anios.add(anio);

      const key = `${producto_id}_${anio}_${mes}`;
      if (!agrupadas[key]) agrupadas[key] = { producto_id, anio, mes, cantidad: 0 };
      agrupadas[key].cantidad += cantidad;

      if (anio === anioActual) {
        hayDatosEnAnioActual = true;
      }
    });

    const detalles: { [producto_id: string]: { titulo: string, imagen: any } } = {};
    await Promise.all(Array.from(productos).map(async producto_id => {
      const detalle = await this.obtenerDetalleProducto(producto_id);
      detalles[producto_id] = {
        titulo: detalle?.producto_titulo,
        imagen: detalle?.imagen?.[0]
      };
    }));

    const ventas: { producto_id: string, titulo: string, anio: number, mes: number, cantidad: number, imagen: any }[] = [];

    anios.add(anioActual);

    productos.forEach(producto_id => {
      anios.forEach(anio => {
        for (let mes = 1; mes <= 12; mes++) {
          const key = `${producto_id}_${anio}_${mes}`;
          const base = agrupadas[key] || { producto_id, anio, mes, cantidad: 0 };
          ventas.push({ ...base, ...detalles[producto_id] });
        }
      });
    });

    ventas.sort((a, b) =>
      a.producto_id.localeCompare(b.producto_id) ||
      a.anio - b.anio ||
      a.mes - b.mes
    );

    return ventas;
  }

  async obtenerEstimacionUsuario(producto_id: string) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const anio = new Date().getFullYear();
    const estimacionesRef = collection(this.firestore, 'estimaciones');
    const q = query(estimacionesRef, where('usuario_id', '==', uid), where('producto_id', '==', producto_id), where('anio', '==', anio));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      let estimacion = docData['estimacion'];
      if (Array.isArray(estimacion)) {
        return estimacion.length === 12 ? estimacion : Array(12).fill(null).map((_,i) => estimacion[i] ?? null);
      }
      if (typeof estimacion === 'object' && estimacion !== null) {
        return Array.from({length: 12}, (_, i) => estimacion[i] ?? null);
      }
      return Array(12).fill(null);
    } else {
      const nuevaEstimacion = {
        usuario_id: uid,
        producto_id,
        anio,
        estimacion: Array(12).fill(null)
      };
      const docRef = doc(estimacionesRef);
      await setDoc(docRef, nuevaEstimacion);
      return nuevaEstimacion.estimacion;
    }
  }

  async actualizarEstimacionUsuario(producto_id: string, estimacion: number[]) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const anio = new Date().getFullYear();
    const estimacionesRef = collection(this.firestore, 'estimaciones');
    const q = query(estimacionesRef, where('usuario_id', '==', uid), where('producto_id', '==', producto_id), where('anio', '==', anio));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { estimacion });
    } else {
      const nuevaEstimacion = {
        usuario_id: uid,
        producto_id,
        anio,
        estimacion
      };
      const docRef = doc(estimacionesRef);
      await setDoc(docRef, nuevaEstimacion);
    }
  }

  async obtenerMiCalificacionProducto(producto_id: string) {
    try {
      const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
      const calificacionRef = collection(this.firestore, 'calificaciones');
      const q = query(calificacionRef, where('usuario_id', '==', uid), where('producto_id', '==', producto_id));
      const querySnapshot = await getDocs(q);

      return querySnapshot.empty? 0 : querySnapshot.docs[0].data()['calificacion'];
    
    } catch (error) {
      console.error('Error al comprobar si el hay calificacion:', error);
      return 0;
    }
  }

  async obtenerPromedioCalificacionProducto(producto_id: string) {
    try {
      const calificacionRef = collection(this.firestore, 'calificaciones');
      const q = query(calificacionRef, where('producto_id', '==', producto_id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return 0;
      }

      let suma = 0;
      let total = 0;

      querySnapshot.forEach(doc => { const data = doc.data();
        if ( data['calificacion'] ) {
          suma += data['calificacion'];
          total++;
        }
      });
      
      return total > 0 ? (suma / total) : 0;

    } catch (error) {
      console.log('Error al obtener calificaciones', error);
      return 0;
    }
  }

  async obtenerPromedioCalificacionTienda(vendedor_id: string) {
    try {
      const calificacionRef = collection(this.firestore, 'calificaciones');
      const q = query(calificacionRef, where('vendedor_id', '==', vendedor_id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return 0;
      }

      let suma = 0;
      let total = 0;

      querySnapshot.forEach(doc => { const data = doc.data();
        if ( data['calificacion'] ) {
          suma += data['calificacion'];
          total++;
        }
      });
      
      return total > 0 ? (suma / total) : 0;

    } catch (error) {
      console.log('Error al obtener calificaciones', error);
      return 0;
    }
  }

  async actualizarCalificacionProducto(producto_id: string, vendedor_id: string, calificacion: number) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   

    const calificacionRef = collection(this.firestore, 'calificaciones');
    const q = query(calificacionRef, where('usuario_id', '==', uid), where('producto_id', '==', producto_id));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = doc(this.firestore, 'calificaciones', querySnapshot.docs[0].id);
      await updateDoc(docRef, { calificacion });

    } else {
      const nuevaCalificacion = {usuario_id: uid, vendedor_id: vendedor_id, producto_id: producto_id, calificacion: calificacion}
      const docRef = doc(calificacionRef);
      await setDoc(docRef, nuevaCalificacion);
    };
  }

  async esComprado(producto_id: string) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    try {
      const pedidosRef = collection(this.firestore, 'pedidos');
      const pedidosSnapshot = await getDocs(query(pedidosRef, where('usuario_id', '==', uid)));

      for (const pedidoDoc of pedidosSnapshot.docs) {
        const pedidoId = pedidoDoc.id;
        const detalleRef = collection(this.firestore, `pedidos/${pedidoId}/detalle`);
        const detalleSnapshot = await getDocs(detalleRef);

        const comprado = detalleSnapshot.docs.some(doc => {
          const data = doc.data();
          return data['producto_id'] === producto_id;
        });

        if (comprado) {
          return true;
        }
      }
      return false;
    } catch (error) {
      this.ionicService.mostrarAlerta('Error al verificar compra', 'error');
      return false;
    }
  }

  async cancelarPedido(pedido_id: string, producto_id: string) {
    try {
      const detallesRef = collection(this.firestore, `pedidos/${pedido_id}/detalle`);
      const q = query(detallesRef, where('producto_id', '==', producto_id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        this.ionicService.mostrarAlerta('Error', 'No se encontró el producto en el pedido.');
        return;
      }

      const detalleDoc = querySnapshot.docs[0];
      const detalleRef = detalleDoc.ref;

      await updateDoc(detalleRef, {
        estado_envio: 'cancelado',
        fecha_cancelacion: new Date(),
      });

      this.ionicService.mostrarAlerta('Éxito', 'Pedido cancelado correctamente.');
    } catch (error) {
      this.ionicService.mostrarAlerta('Error', 'No se pudo cancelar el pedido. Intenta nuevamente.');
    }
  }

  async solicitarDevolucionProducto(pedido_id: string, producto_id: string, tipo: string) {
    try {
      const detallesRef = collection(this.firestore, `pedidos/${pedido_id}/detalle`);
      const q = query(detallesRef, where('producto_id', '==', producto_id));
      const querySnapshot = await getDocs(q);
      
      const detalleDoc = querySnapshot.docs[0];
      const detalleRef = detalleDoc.ref;
      
      await updateDoc(detalleRef, {
      estado_reembolso: 'pendiente',
      tipo_reembolso: tipo,
      fecha_solicitud_reembolso: new Date(),
    });
  } catch (error: any) {
    console.log(error);
    }
  }
 

  // ======================== MIS PRODUCTOS PAGE =========================
  // Métodos de clase producto

obtenerMisProductos(): Observable<Producto[]> {
  return from(this.authService.obtenerPerfil()).pipe(
    switchMap((sesion) => {
      if (!sesion?.id) return of([]); // por si no hay sesión

      const productosRef = collection(this.firestore, 'productos');
      const q = query(
        productosRef,
        where('usuario_id', '==', sesion.id),
        where('esta_eliminado', '==', false)
      );
      return collectionData(q, { idField: 'producto_id' }) as Observable<Producto[]>;
    })
  );
}


async eliminarProducto(producto_id: string) {
  try {
    const productoRef = doc(this.firestore, 'productos', producto_id);
    await setDoc(productoRef, { esta_eliminado: true }, { merge: true });
    console.log(`Producto con ID ${producto_id} marcado como eliminado.`);
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    throw error;
  }
}


  async guardarProducto(producto: Producto) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    // const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const productosRef = collection(this.firestore, 'productos');
    const nuevoProductoRef = doc(productosRef);
    const nuevoProducto = {
      ...producto,
      producto_id: nuevoProductoRef.id,
      usuario_id: uid,
      esta_eliminado: false,
    };
    await setDoc(nuevoProductoRef, nuevoProducto);
    return {id: nuevoProductoRef.id, producto: nuevoProducto};
  }

  async editarProducto(producto_id: string, producto: Partial<Producto>) {
    const productoRef = doc(this.firestore, 'productos', producto_id);
    await updateDoc(productoRef, producto);
  }

  // Métodos de clase oferta
  async obtenerOfertaPorProducto(producto_id: string): Promise<Oferta[]> {
    const ofertasRef = collection(this.firestore, 'ofertas');
    const q = query(ofertasRef, where('producto_id', '==', producto_id));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Oferta));
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

  obtenerOfertasPorProducto(producto_id: string): Observable<Oferta[]> {
    const ofertasRef = collection(this.firestore, 'ofertas');
    const q = query(ofertasRef, where('producto_id', '==', producto_id));
    return collectionData(q, { idField: 'id' }) as Observable<Oferta[]>;
  }

  async eliminarOfertasPorProducto(producto_id: string): Promise<void> {
    try {
      const ofertas = await firstValueFrom(
        this.obtenerOfertasPorProducto(producto_id)
      );

      if (ofertas && ofertas.length > 0) {
        const eliminarPromises = ofertas.map((oferta) =>
          this.eliminarOferta(oferta.id ?? 'uid')
        );
        await Promise.all(eliminarPromises);
        console.log(
          `Se eliminaron ${ofertas.length} ofertas del producto con ID: ${producto_id}`
        );
      } else {
        console.log(
          `No se encontraron ofertas para el producto con ID: ${producto_id}`
        );
      }
    } catch (error) {
      console.error(
        `Error al eliminar las ofertas del producto con ID: ${producto_id}`,
        error
      );
      throw error;
    }
  }

  async guardarOferta(oferta: Oferta, producto: Producto) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    // const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const ofertasRef = collection(this.firestore, 'ofertas');
    const nuevaOfertaRef = doc(ofertasRef);
    const nuevaOferta = {
      ...oferta,
      usuario_id: uid,
      producto_id: producto.producto_id
    };
    await setDoc(nuevaOfertaRef, nuevaOferta);
    return nuevaOferta;
  }

  async editarOferta(oferta_id: string, oferta: Oferta) {
    const ofertaRef = doc(this.firestore, 'ofertas', oferta_id);
    await setDoc(ofertaRef, oferta, { merge: true });
  }

  obtenerCategoriasDB(): Observable<any[]> {
    const categoriasRef = collection(this.firestore, 'categorias');
    return collectionData(categoriasRef, { idField: 'id' }) as Observable<any[]>;
  }

  async guardarCategoria(categoria: Categoria) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    // const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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

  // ======================== DIRECCIONES =========================
  async obtenerDireccionesUsuario(): Promise<any[]> {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    // const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const direccionesRef = collection(this.firestore, 'direcciones');
    const q = query(direccionesRef, where('usuario_id', '==', uid));
    const querySnapshot = await getDocs(q);
    const direcciones: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      direcciones.push({
        id: doc.id,
        ...data,
      });
    }
    );
    return direcciones;
  }

  async guardarDireccion(direccion: any) {
    const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const direccionesRef = collection(this.firestore, 'direcciones');
    const nuevaDireccionRef = doc(direccionesRef);
    const nuevaDireccion = {
      ...direccion,
      usuario_id: uid,
      fecha_creacion: new Date().toISOString(),
    };
    await setDoc(nuevaDireccionRef, nuevaDireccion);
    return nuevaDireccion;
  }

  async obtenerProductosAleatorios(limit: number, excluirIds: string[] = []): Promise<Producto[]> {
    const productosRef = collection(this.firestore, 'productos');
    const snap = await getDocs(productosRef);

    const productos: Producto[] = snap.docs
      .map(doc => ({ producto_id: doc.id, ...doc.data() } as Producto))
      .filter(producto =>
        producto.stock > 0 &&
        !producto.esta_eliminado &&
        producto.producto_id &&
        !excluirIds.includes(producto.producto_id) 
      )
    const mezclados = productos
      .map(p => ({ p, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(({ p }) => p);

    return mezclados.slice(0, limit);
  }


  async recuperarBoletaConOrdenCompra(ordenCompra: string): Promise<any> {
    const ref = collection(this.firestore, 'boletas');
    const q = query(ref, where('ordenCompra', '==', ordenCompra));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return snapshot.docs[0].data();
  }
}