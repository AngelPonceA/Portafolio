import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, onSnapshot, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class TriggersService {

  constructor( private firestore: Firestore ) { }

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

}
