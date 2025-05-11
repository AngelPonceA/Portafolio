import { CrudService } from './../crud/crud.service';
import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private carritoStorage = 'carrito';

  constructor( private nativeStorage: NativeStorage, private crudService: CrudService, private firestore: Firestore) { }

  async agregarProductoAlCarrito(producto_id: string, cantidad: number) {
    try {
      const producto = await this.crudService.obtenerDetalleProducto(producto_id);

      if (!producto) {
        console.error('Producto no encontrado.');
        return false;
      }

      const carrito = (await this.nativeStorage.getItem(this.carritoStorage)) || [];
      const productoExistente = carrito.find((item: any) => item.producto_id === producto_id);

      const cantidadTotal = productoExistente ? productoExistente.cantidad + cantidad : cantidad;

      if (cantidadTotal > producto.stock) {
        console.error('No se puede agregar más cantidad. Stock insuficiente.');
        return false;
      }

      // Agregar o actualizar el producto en el carrito
      if (productoExistente) {
        productoExistente.cantidad = cantidadTotal;
      } else {
        carrito.push({ producto_id, cantidad });
      }

      await this.nativeStorage.setItem(this.carritoStorage, carrito);
      console.log('Producto agregado al carrito:', carrito);
      return true;
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      return false;
    }
  }

  async obtenerCarrito() {
    try {
      const carrito = (await this.nativeStorage.getItem(this.carritoStorage)) || [];
      console.log('Carrito obtenido:', carrito);
      return carrito;
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      return [];
    }
  }

  async guardarCarrito(productos: any) {
    try {
      await this.nativeStorage.setItem('carritoStorage', productos);
      console.log('Carrito guardado en NativeStorage:', productos);
    } catch (error) {
      console.error('Error al guardar el carrito en NativeStorage:', error);
    }
  }
  async limpiarCarrito() {
    try {
      await this.nativeStorage.remove(this.carritoStorage);
      console.log('Carrito limpiado');
    } catch (error) {
      console.error('Error al limpiar el carrito:', error);
    }
  }

  calcularTotal(productos: any | any[]): number {
    const productosArray = Array.isArray(productos) ? productos : [productos];
  
    let total: number = 0;
    for (const producto of productosArray) {
      const precioUnitario = producto.precio_oferta || producto.precio;
      total += precioUnitario * producto.cantidad;
    }
    return total;
  }

  calcularComision(productos: any | any[]): number {
    const productosArray = Array.isArray(productos) ? productos : [productos];
  
    let comision: number = 0;
    const valor_comision = 0.10;
  
    for (const producto of productosArray) {
      const precio = producto.precio_oferta || producto.precio;
      comision += (precio * producto.cantidad) * valor_comision;
    }
    return comision;
  }

  async registrarCompra(productos: any | any[], detallesPago: any) {
    try {
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
      const lista = Array.isArray(productos) ? productos : [productos];
  
      const pedido = await addDoc(collection(this.firestore, 'pedidos'), {
        usuario_id: uid,
        fecha_creacion: new Date(),
        total_pagado: this.calcularTotal(lista),
        total_comision: this.calcularComision(lista),
        estado_pago: detallesPago.status,
        medio_pago: detallesPago.purchase_units[0].soft_descriptor,
      });
  
      console.log('Pedido creado:', pedido.id);
  
      for (const producto of lista) {
        const precio = producto.precio_oferta || producto.precio;
        const total = precio * producto.cantidad;
        const comision = total * 0.1;
  
        await addDoc(collection(this.firestore, `pedidos/${pedido.id}/detalle`), {
          pedido_id: pedido.id,
          vendedor_id: producto.vendedor_id,
          producto_titulo: producto.producto_titulo,
          cantidad: producto.cantidad,
          valor_unitario: precio,
          valor_total: total,
          valor_comision: comision,
          estado_envio: 'pendiente',
          numero_seguimiento: ''
        });
      }
  
      const porVendedor: Record<string, any[]> = {};
      for (const producto of lista) {
        const vendedorId = producto.vendedor_id;
        const precio = producto.precio_oferta || producto.precio;
        const total = precio * producto.cantidad;
        const comision = total * 0.1;
  
        if (!porVendedor[vendedorId]) {
          porVendedor[vendedorId] = [];
        }
  
        porVendedor[vendedorId].push({
          producto_titulo: producto.producto_titulo,
          cantidad: producto.cantidad,
          valor_unitario: precio,
          valor_total: total,
          valor_comision: comision
        });
      }
  
      for (const vendedorId in porVendedor) {
        await addDoc(collection(this.firestore, `ventas/${vendedorId}/detalle`), {
          pedido_id: pedido.id,
          comprador_id: uid,
          productos: porVendedor[vendedorId],
          fecha_creacion: new Date(),
          estado_envio: 'pendiente',
          numero_seguimiento: ''
        });
      }
  
      console.log('Órdenes de venta agrupadas creadas');
    } catch (error) {
      console.error('Error al registrar la compra:', error);
    }
  }
  

}