import { Categoria } from './../../models/categoria.models';
import { inject, Injectable, Injector } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, collection, collectionData, deleteDoc, doc, getDoc, getDocs, query, setDoc, where, updateDoc, orderBy, onSnapshot, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { combineLatest, firstValueFrom, from, map, Observable, of, switchMap } from 'rxjs';
import { Producto } from '../../models/producto.models';
import { Oferta } from 'src/app/models/oferta.models';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { IonicService } from "src/app/services/ionic/ionic.service";
import { AuthService } from '../auth/auth.service';

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
      this.obtenerOfertas()
    ]).pipe(
      map(([productos, ofertas]) => {
        return productos.filter(producto => producto.stock > 0 && !producto.esta_eliminado).map(producto => {
            const oferta = ofertas.find(o => o.producto_id === producto.producto_id);
            return oferta ? { ...producto, oferta } : { ...producto };
          });
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

  obtenerProductosSinOferta(): Observable<Producto[]> {
    return this.obtenerProductosYOferta().pipe(
      map((productos) => {
        const now = new Date();
        return productos.filter(item =>
          !item.oferta ||
          now < item.oferta.fecha_inicio.toDate() ||
          now > item.oferta.fecha_fin.toDate()
        );
      })
    );
  }

  obtenerProductosConOferta(): Observable<Producto[]> {
    return this.obtenerProductosYOferta().pipe(
      map((productos) => {
        const now = new Date();
        return productos.filter(item =>
          item.oferta &&
          now >= item.oferta.fecha_inicio.toDate() &&
          now <= item.oferta.fecha_fin.toDate()
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
          const now = new Date();

          if (now >= oferta['fecha_inicio'].toDate() && now <= oferta['fecha_fin'].toDate()) {
            precio_oferta = oferta['precio_oferta'];
          }
        });
      }

      return {
        producto_id: producto_id,
        vendedor_id: producto['usuario_id'],
        producto_titulo: producto['titulo'],
        producto_descripcion: producto['descripcion'],
        etiquetas: producto['etiquetas'] || [],
        categoria: producto['categoria'],
        esta_eliminado: producto['esta_eliminado'],
        precio: producto['precio'],
        precio_oferta: precio_oferta,
        stock: producto['stock'],
        estado: producto['estado'],
        atributo: producto['atributo'],
        imagen: producto['imagen'],
      };

    } catch (error) {
      console.error('Error al obtener los detalles del producto:', error);
      return null;
    }
  }

  obtenerFavoritosConDetalles() {
    // const uid = this.authService.obtenerSesion().then(sesion => sesion.id);
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const favoritosRef = collection(this.firestore, 'favoritos');
    const q = query(favoritosRef, where('usuario_id', '==', uid));

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
      // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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
    // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const favoritosRef = collection(this.firestore, 'favoritos');
    // Verifica si ya existe el favorito antes de agregarlo
    const q = query(favoritosRef, where('usuario_id', '==', uid), where('producto_id', '==', producto_id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Ya existe el favorito, no lo agrega de nuevo
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
      // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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
      // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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

        // Accede a la subcolección 'detalle' de este pedido
        const detalleRef = collection(this.firestore, `pedidos/${pedido_id}/detalle`);
        const detalleSnapshot = await getDocs(detalleRef);

        const detalles = detalleSnapshot.docs.map(doc => doc.data());

        historial.push({ pedido_id, ...pedidoData, detalles });
      }

      console.log('historial', historial);
      
      return historial;
    } catch (error) {
      this.ionicService.mostrarAlerta('Error al obtener el historial de compra', 'error');
      return [];
    }
  }

  async obtenerVentasHistoricas() {
    // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const ventasRef = collection(this.firestore, `ventas/${uid}/detalle`);
    const ventasSnapshot = await getDocs(ventasRef);

    // Agrupa y suma ventas por producto, año y mes
    const agrupadas: { [key: string]: { producto_id: string, anio: number, mes: number, cantidad: number } } = {};
    const productos = new Set<string>();
    const anios = new Set<number>();

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
  // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
  const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
  const anio = new Date().getFullYear();
  const estimacionesRef = collection(this.firestore, 'estimaciones');
  const q = query(
    estimacionesRef,
    where('usuario_id', '==', uid),
    where('producto_id', '==', producto_id),
    where('anio', '==', anio)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docData = querySnapshot.docs[0].data();
    let estimacion = docData['estimacion'];
    if (Array.isArray(estimacion)) {
      return estimacion.length === 12 ? estimacion : Array(12).fill(null).map((_,i) => estimacion[i] ?? null);
    }
    // Si es objeto (caso antiguo), conviértelo a array
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
    // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const anio = new Date().getFullYear();
    const estimacionesRef = collection(this.firestore, 'estimaciones');
    const q = query(estimacionesRef, where('usuario_id', '==', uid), where('producto_id', '==', producto_id), where('anio', '==', anio));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Actualiza el documento existente
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, { estimacion });
    } else {
      // Crea uno nuevo
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

  escucharCambiosPedidos() {
    const pedidosRef = collection(this.firestore, 'pedidos');

    onSnapshot(pedidosRef, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'modified') {
          const pedido = change.doc.data();
          const pedido_id = change.doc.id;
          const estadoActual = pedido['estado_envio'];
          const usuario_id = pedido['usuario_id'];

          const estadosNotificables = ['En despacho', 'Recibido', 'En proceso', 'Cancelado'];

          if (estadosNotificables.includes(estadoActual)) {
            const notificacionId = `${pedido_id}_${estadoActual}`;
            const notificacionRef = doc(this.firestore, 'alertas', notificacionId);

            const existingSnap = await getDoc(notificacionRef);

            let descripcion;

            if (estadoActual == 'En despacho') {
              descripcion = `Tu pedido ${pedido_id} está ${estadoActual}.`
            } else if (estadoActual == 'Recibido') {
              descripcion = `Tu pedido ${pedido_id} ha sido ${estadoActual}.`
            } else if (estadoActual == 'En proceso') {
              descripcion = `Tu pedido ${pedido_id} está ${estadoActual}.`
            } else if (estadoActual == 'Cancelado') {
              descripcion = `Tu pedido ${pedido_id} ha sido ${estadoActual}.`
            }

            if (!existingSnap.exists()) {
              await setDoc(notificacionRef, {
                titulo: 'Estado de tu pedido actualizado',
                descripcion: descripcion,
                estado: 'no vista',
                fecha_creacion: new Date(),
                usuario_id: usuario_id,
                pedido_id: pedido_id,
              });
            }
          }
        }
      }
    });
  }

  // ======================== MIS PRODUCTOS PAGE =========================
  // Métodos de clase producto
obtenerMisProductos(): Observable<Producto[]> {
  // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
  const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
  const productosRef = collection(this.firestore, 'productos');
  const q = query(productosRef, where('usuario_id', '==', uid), where('esta_eliminado', '==', false));

  return collectionData(q, { idField: 'producto_id' }) as Observable<Producto[]>;
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
    // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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
    try {
      const productoRef = doc(this.firestore, 'productos', producto_id);
      await updateDoc(productoRef, producto);
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
    }
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
    // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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
    // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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
    // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
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
    // const uid = await this.authService.obtenerSesion().then(sesion => sesion.id);   
    const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
    const direccionesRef = collection(this.firestore, 'direcciones');
    const nuevaDireccionRef = doc(direccionesRef);
    const nuevaDireccion = {
      ...direccion,
      usuario_id: uid,
      id: nuevaDireccionRef.id,
      fecha_creacion: new Date().toISOString(),
    };
    await setDoc(nuevaDireccionRef, nuevaDireccion);
    return nuevaDireccion;
  }
}

