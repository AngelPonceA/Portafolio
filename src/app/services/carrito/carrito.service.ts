import { CrudService } from './../crud/crud.service';
import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { IonicService } from "src/app/services/ionic/ionic.service";
import { AuthService } from '../auth/auth.service';

type Comuna = 'STGO' | 'MAIPU' | 'LA_FLORIDA' | 'PROVIDENCIA' | 'LAS_CONDES';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private carritoStorage = 'carrito';
  private comunaDestino: Comuna = 'STGO';

  constructor( private nativeStorage: NativeStorage, private crudService: CrudService, private firestore: Firestore,
    private ionicService: IonicService, private authService: AuthService) { }

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

  async eliminarProductoDelCarrito(producto_id: string) {
    try {
      const carrito = (await this.nativeStorage.getItem(this.carritoStorage)) || [];
      const nuevoCarrito = carrito.filter((item: any) => item.producto_id !== producto_id);
      await this.nativeStorage.setItem(this.carritoStorage, nuevoCarrito);
      console.log('Producto eliminado del carrito:', nuevoCarrito);
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
    }
  }

  async carritoSumarRestar(accion: string, cantidad: number, producto_id: string) {
    try {
      const carrito = (await this.nativeStorage.getItem(this.carritoStorage)) || [];
      const producto = carrito.find((item: any) => item.producto_id === producto_id);

      if (producto) {
        if (accion === 'sumar') {
          if (producto.cantidad < producto.stock) {
            producto.cantidad += cantidad;
          } else {
            console.error('No se puede sumar más cantidad. Stock insuficiente.');
          }
        } else if (accion === 'restar') {
          if (producto.cantidad > 1) {
            producto.cantidad -= cantidad;
          } else {
            console.error('No se puede restar más cantidad. Cantidad mínima alcanzada.');
          }
        }

        await this.nativeStorage.setItem(this.carritoStorage, carrito);
        console.log('Carrito actualizado:', carrito);
      }
    }
    catch (error) {
      console.error('Error al sumar/restar producto en el carrito:', error);
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
      const lista = (Array.isArray(productos) ? productos : [productos]).filter((p: any) => p.cantidad > 0);

      if (lista.length === 0) {
        console.error('No hay productos con cantidad mayor a 0 para registrar la compra.');
        return;
      }

      const pedidoRef = await this.crearPedido(uid, lista, detallesPago);

      await this.insertarDetallesYActualizarStock(pedidoRef.id, lista);

      const porVendedor = this.agruparPorVendedor(lista);

      await this.insertarVentasPorVendedor(porVendedor, pedidoRef.id, uid);

      await this.authService.actualizarRecomendadosUsuario(lista);
      this.ionicService.mostrarAlerta('Compra exitosa', 'Compra registrada con éxito.');
    } catch (error: any) {
      this.ionicService.mostrarAlerta('Error al registrar la compra:', error);
    }
  }

  async crearPedido(uid: string, lista: any[], detallesPago: any) {
    const pedidoRef = await addDoc(collection(this.firestore, 'pedidos'), {
      usuario_id: uid,
      fecha_creacion: new Date(),
      total_pagado: this.calcularTotal(lista),
      total_comision: this.calcularComision(lista),
      estado_pago: detallesPago.status,
      medio_pago: detallesPago.purchase_units[0].soft_descriptor,
    });
    console.log('Funcion crearPedido Exito');
    return pedidoRef;
  }

  async insertarDetallesYActualizarStock(pedidoId: string, lista: any[]) {
    for (const producto of lista) {
      const precio = producto.precio_oferta || producto.precio;
      const total = precio * producto.cantidad;
      const comision = total * 0.1;

      await addDoc(collection(this.firestore, `pedidos/${pedidoId}/detalle`), {
        pedido_id: pedidoId,
        vendedor_id: producto.vendedor_id,
        producto_id: producto.producto_id,
        producto_titulo: producto.producto_titulo,
        cantidad: producto.cantidad,
        valor_unitario: precio,
        valor_total: total,
        // Nuevo
        subtotal: total - comision,
        valor_comision: comision,
        // Nuevo
        estado_envio: 'pendiente',
        costo_envio: 0,
        fecha_recepcion: null,
        numero_seguimiento: null,
      });

      const productoRef = doc(this.firestore, `productos/${producto.producto_id}`);
      const productoSnap = await this.crudService.obtenerDetalleProducto(producto.producto_id);
      const stockActual = productoSnap?.stock ?? 0;
      const nuevoStock = stockActual - producto.cantidad;
      if (nuevoStock < 0) {
        throw new Error(`Stock insuficiente para el producto ${producto.producto_id}`);
      }
      console.log('Funcion insertarDetallesYActualizarStock Exito');
      await setDoc(productoRef, { stock: nuevoStock }, { merge: true });
    }
  }

  agruparPorVendedor(lista: any[]): Record<string, any[]> {
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
        producto_id: producto.producto_id,
        producto_titulo: producto.producto_titulo,
        cantidad: producto.cantidad,
        valor_unitario: precio,
        valor_total: total,
        valor_comision: comision
      });
    }
    console.log('Funcion agruparPorVendedor Exito');
    return porVendedor;
  }

  async insertarVentasPorVendedor(porVendedor: Record<string, any[]>, pedidoId: string, compradorId: string) {
    for (const vendedorId in porVendedor) {
      for (const producto of porVendedor[vendedorId]) {
        const fecha = new Date();
        await addDoc(collection(this.firestore, `ventas/${vendedorId}/detalle`), {
          pedido_id: pedidoId,
          producto_id: producto.producto_id,
          comprador_id: compradorId,
          cantidad: producto.cantidad,
          fecha: {
            dia: fecha.getDate(),
            mes: fecha.getMonth() + 1,
            anio: fecha.getFullYear()
          }
        });
      }
    }
    console.log('Funcion insertarVentasPorVendedor Exito');
  }
  
  async calcularCostoEnvioProducto(producto: any): Promise<number> {
    // Costos base por comuna (en pesos chilenos)
    const costosPorComuna: Record<Comuna, number> = {
      'STGO': 3000,
      'MAIPU': 3500,
      'LA_FLORIDA': 4000,
      'PROVIDENCIA': 3000,
      'LAS_CONDES': 3500
    };

    // Costo base según la comuna seleccionada
    const costoBase = costosPorComuna[this.comunaDestino as Comuna] || 5000;

    // Factor de peso/tamaño (simulado, en la realidad esto vendría de los atributos del producto)
    const factorPeso = 1.0;

    // Cálculo final considerando cantidad de productos
    return costoBase * factorPeso * producto.cantidad;
  }

  setComunaDestino(comuna: Comuna): void {
    this.comunaDestino = comuna;
  }
}