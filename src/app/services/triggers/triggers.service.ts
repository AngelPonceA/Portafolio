import { CrudService } from './../crud/crud.service';
import { Injectable } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, getDoc, getDocs, onSnapshot, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TriggersService {

  constructor( private firestore: Firestore, private crudService: CrudService ) { }

  escucharCambiosPedido() {
    const pedidosRef = collection(this.firestore, 'pedidos');

    onSnapshot(pedidosRef, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'modified') {
          const pedido = change.doc.data();
          const pedido_id = change.doc.id;
          const estadoActual = pedido['estado_envio'].toLowerCase();
          const usuario_id = pedido['usuario_id'];

          const estadosNotificables = ['en despacho', 'recibido', 'en proceso', 'cancelado', 'reembolsado'];

          if (estadosNotificables.includes(estadoActual)) {
            const notificacion_id = `${pedido_id}_${estadoActual}`;
            const notificacionRef = doc(this.firestore, 'alertas', notificacion_id);

            const existingSnap = await getDoc(notificacionRef);

            let descripcion;

            if (estadoActual == 'en despacho') {
              descripcion = `Tu pedido ${pedido_id} está ${estadoActual}.`
            } else if (estadoActual == 'recibido') {
              descripcion = `Tu pedido ${pedido_id} ha sido ${estadoActual}.`
            } else if (estadoActual == 'en proceso') {
              descripcion = `Tu pedido ${pedido_id} está ${estadoActual}.`
            } else if (estadoActual == 'cancelado') {
              descripcion = `Tu pedido ${pedido_id} ha sido ${estadoActual}.`
            } else if (estadoActual == 'reembolsado') {
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

  escucharCambiosDetallePedido() {
    const pedidosRef = collection(this.firestore, 'pedidos');

    onSnapshot(pedidosRef, (snapshot) => {
      snapshot.forEach((pedidoDoc) => {
        const pedido_id = pedidoDoc.id;
        const usuario_id = pedidoDoc.data()['usuario_id'];

        const detalleRef = collection(this.firestore, `pedidos/${pedido_id}/detalle`);

        onSnapshot(detalleRef, async (detalleSnapshot) => {
          for (const change of detalleSnapshot.docChanges()) {
            if (change.type === 'modified') {
              const detalle = change.doc.data();
              const documento_id = change.doc.id;
              const estadoActual = detalle['estado_envio'].toLowerCase();
              const detalle_producto = detalle['producto_titulo'];
              const producto_id = detalle['producto_id'];
              const detalleProducto = await this.crudService.obtenerDetalleProducto(producto_id);
              const imagen = detalleProducto?.imagen;

              const estadosNotificables = ['en despacho', 'recibido', 'en proceso', 'cancelado', 'reembolsado'];

              if (estadosNotificables.includes(estadoActual)) {

                const notificacion_id = `${pedido_id}_detalle_${documento_id}_estado_${estadoActual}`;
                const notificacionRef = doc(this.firestore, 'alertas', notificacion_id);

                const existingSnap = await getDoc(notificacionRef);

                let descripcion;

                if (estadoActual == 'en despacho') {
                  descripcion = `Tu pedido ${detalle_producto} está ${estadoActual}.`
                } else if (estadoActual == 'recibido') {
                  descripcion = `Tu pedido ${detalle_producto} ha sido ${estadoActual}.`
                } else if (estadoActual == 'en proceso') {
                  descripcion = `Tu pedido ${detalle_producto} está ${estadoActual}.`
                } else if (estadoActual == 'cancelado') {
                  descripcion = `Tu pedido ${detalle_producto} ha sido ${estadoActual}.`
                } else if (estadoActual == 'reembolsado') {
                  descripcion = `Tu pedido ${detalle_producto} ha sido ${estadoActual}.`
                }

                if (!existingSnap.exists()) {
                  await setDoc(notificacionRef, {
                    titulo: 'Detalle del pedido actualizado',
                    descripcion: descripcion,
                    estado: 'no vista',
                    fecha_creacion: new Date(),
                    imagen: imagen[0],
                    usuario_id: usuario_id,
                    pedido_id: pedido_id,
                  });
                }
              }
            }
          }
        });
      });
    });
  }

  escucharCambiosStock() {
    const productosRef = collection(this.firestore, 'productos');

    onSnapshot(productosRef, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'modified') {
          const producto = change.doc.data();
          const producto_id = change.doc.id;
          const stockActual = producto['stock'];
          const stockMinimo = producto['inventario_minimo'];
          const stockEstado = producto['auto_stock'];
          const usuario_id = producto['usuario_id'];
          const imagen = producto['imagen'];
          const producto_titulo = producto['titulo'];

          const notificacion_id = `${producto_id}_stock_bajo`;
          const notificacionRef = doc(this.firestore, 'alertas', notificacion_id);
          const existingSnap = await getDoc(notificacionRef);

          if (stockActual <= stockMinimo && stockEstado) {
            if (!existingSnap.exists()) {
              let mensaje = '';

              if (stockActual === stockMinimo) {
                mensaje = 'está en su cantidad mínima deseada, puedes eliminar esta notificacion o ajustar el stock del producto para su eliminación automatica.';
              } else if (stockActual < stockMinimo) {
                mensaje = 'está por debajo de la cantidad mínima deseada, puedes eliminar esta notificacion o ajustar el stock del producto para su eliminación automatica.';
              }

              await setDoc(notificacionRef, {
                titulo: 'Alerta de stock',
                descripcion: `El stock del producto ${producto_titulo} ${mensaje}`,
                estado: 'no vista',
                imagen: imagen?.[0],
                fecha_creacion: new Date(),
                usuario_id: usuario_id,
                producto_id: producto_id,
              });
            }

          } else {
            if (existingSnap.exists() && stockActual > stockMinimo) {
              await deleteDoc(notificacionRef);
            }
          }
        }
      }
    });
  }

  escucharCreacionPedido() {
    const pedidosRef = collection(this.firestore, 'pedidos');

    onSnapshot(pedidosRef, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const pedido_id = change.doc.id;

          const detallesRef = collection(this.firestore, `pedidos/${pedido_id}/detalle`);
          const detallesSnap = await getDocs(detallesRef);

          for (const detalleDoc of detallesSnap.docs) {
            const detalle = detalleDoc.data();
            const producto_id = detalle['producto_id'];
            const vendedor_id = detalle['vendedor_id'];
            const producto_titulo = detalle['producto_titulo'];

            const notificacion_id = `${pedido_id}_${producto_id}_nuevo_pedido`;
            const notificacionRef = doc(this.firestore, 'alertas', notificacion_id);
            const existingSnap = await getDoc(notificacionRef);

            if (!existingSnap.exists()) {
              await setDoc(notificacionRef, {
                titulo: 'Tienes un nuevo pedido',
                descripcion: `Se ha realizado un pedido para tu producto "${producto_titulo}".`,
                estado: 'no vista',
                fecha_creacion: new Date(),
                usuario_id: vendedor_id,
                pedido_id: pedido_id,
              });
            }
          }
        }
      }
    });
  }

}
