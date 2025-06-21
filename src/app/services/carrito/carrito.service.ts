import { CrudService } from './../crud/crud.service';
import { Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { IonicService } from "src/app/services/ionic/ionic.service";
import { AuthService } from '../auth/auth.service';
import { UbicacionService } from '../ubicacion/ubicacion.service';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private carritoStorage = 'carrito';

  constructor(  private nativeStorage: NativeStorage, 
                private crudService: CrudService, 
                private firestore: Firestore,
                private ionicService: IonicService, 
                private authService: AuthService,
                private ubicacionService: UbicacionService) { }

  async comprobarCarrito() {
    try {
      const carrito = await this.nativeStorage.getItem(this.carritoStorage);

      // if (Array.isArray(carrito) && carrito.length > 0) {
      //   this.ionicService.mostrarAlerta('Carrito existente', `Tienes ${carrito.length} producto(s) en el carrito.`);
      // } else {
      //   this.ionicService.mostrarAlerta('Carrito vacío', 'No tienes productos en el carrito.');
      // }

    } catch (error) {
      const carritoVacio: any[] = [];
      await this.nativeStorage.setItem(this.carritoStorage, carritoVacio);
      // this.ionicService.mostrarAlerta('Carrito creado', 'Tu carrito ha sido inicializado.');
    }
  }

  async agregarProductoAlCarrito(producto_id: string, cantidad: number) {
    try {
      const producto = await this.crudService.obtenerDetalleProducto(producto_id);

      if (!producto) {
        this.ionicService.mostrarAlerta('Error', 'Producto no encontrado.');
        return false;
      }

      if (cantidad > producto.stock) {
        this.ionicService.mostrarAlerta('Error', 'Cantidad deseada supera el stock disponible.');
        return false;
      }

      const carrito = (await this.nativeStorage.getItem(this.carritoStorage)) || [];

      const posicion = carrito.findIndex((item: any) => item.producto_id === producto_id);

      if (posicion !== -1) {
        carrito[posicion].cantidad = cantidad;
      } else {
        carrito.push({ producto_id, cantidad });
      }

      await this.nativeStorage.setItem(this.carritoStorage, carrito);
      this.ionicService.mostrarToastAbajo(`Producto agregado al carrito.`);
      return true;

    } catch (error) {
      this.ionicService.mostrarAlerta('Error', `Error al agregar producto al carrito: ${error}`);
      return false;
    }
  }


  async obtenerCarrito() {
    try {
      const carrito = await this.nativeStorage.getItem(this.carritoStorage);
      return carrito;
    } catch (error) {
      this.ionicService.mostrarAlerta('Error', `Error al obtener el carrito: ${error}`);
      return [];
    }
  }

  async obtenerCantidadCarrito() {
    try {
      const carrito = await this.obtenerCarrito();
      return Array.isArray(carrito) ? carrito.length : 0;
    } catch (error) {
      return 0;
    }
  }

  async eliminarProductoDelCarrito(producto_id: string) {
    try {
      const carrito = (await this.nativeStorage.getItem(this.carritoStorage)) || [];
      const nuevoCarrito = carrito.filter((item: any) => item.producto_id !== producto_id);
      await this.nativeStorage.setItem(this.carritoStorage, nuevoCarrito);
    } catch (error) {
      this.ionicService.mostrarAlerta('Error', `Error al eliminar producto del carrito: ${error}`);
    }
  }

  async carritoSumarRestar(accion: 'sumar' | 'restar', cantidad: number, producto_id: string) {
    try {
      const carrito = (await this.nativeStorage.getItem(this.carritoStorage)) || [];
      const posicion = carrito.findIndex((item: any) => item.producto_id === producto_id);

      if (posicion === -1) {
        this.ionicService.mostrarAlerta('Error', 'Producto no encontrado en el carrito.');
        return;
      }

      const productoCarrito = carrito[posicion];
      const producto = await this.crudService.obtenerDetalleProducto(producto_id);

      if (!producto || typeof producto.stock !== 'number') {
        this.ionicService.mostrarAlerta('Error', 'No se pudo verificar el stock del producto.');
        return;
      }

      if (accion === 'sumar') {
        const nuevaCantidad = productoCarrito.cantidad + cantidad;
        if (nuevaCantidad <= producto.stock) {
          productoCarrito.cantidad = nuevaCantidad;
        } else {
          this.ionicService.mostrarAlerta('Error', 'No se puede sumar más cantidad. Stock insuficiente.');
          return;
        }
      } else if (accion === 'restar') {
        const nuevaCantidad = productoCarrito.cantidad - cantidad;
        if (nuevaCantidad >= 1) {
          productoCarrito.cantidad = nuevaCantidad;
        } else {
          this.ionicService.mostrarAlerta('Error', 'Cantidad mínima alcanzada.');
          return;
        }
      }

      await this.nativeStorage.setItem(this.carritoStorage, carrito);

    } catch (error) {
      this.ionicService.mostrarAlerta('Error', `Error al actualizar el carrito: ${error}`);
    }
  }


  async guardarCarrito(productos: any) {
    try {
      await this.nativeStorage.setItem('carritoStorage', productos);
      this.ionicService.mostrarToastAbajo('Carrito guardado correctamente.');
    } catch (error) {
      this.ionicService.mostrarAlerta('Error', `Error al guardar el carrito en NativeStorage: ${error}`);
    }
  }
  
  async limpiarCarrito() {
    try {
      await this.nativeStorage.remove(this.carritoStorage);
      this.comprobarCarrito();
      this.ionicService.mostrarToastAbajo('Carrito limpiado.');
    } catch (error) {
      this.ionicService.mostrarAlerta('Error', `Error al limpiar el carrito: ${error}`);
    }
  }

  calcularTotal(productos: any | any[]): number {
    const productosArray = Array.isArray(productos) ? productos : [productos];
  
    let total: number = 0;
    for (const producto of productosArray) {
      const precioUnitario = producto.precio_oferta || producto.precio;
      total += (precioUnitario * producto.cantidad) + producto.costo_envio;
    }
    return total;
  }

  calcularComision(productos: any | any[]): number {
    const productosArray = Array.isArray(productos) ? productos : [productos];
  
    let comision: number = 0;
    const valor_comision = 0.10;
  
    for (const producto of productosArray) {
      const precio = producto.precio_oferta || producto.precio;
      comision += ((precio * producto.cantidad) + producto.costo_envio) * valor_comision;
    }
    return comision;
  }

  async registrarCompra(productos: any | any[], direccion: any, detallesPago: any) {
    try {
      const uid = 'LtOy7x75rVTK4f56xhErfdDPEs92';
      const lista = (Array.isArray(productos) ? productos : [productos]).filter((p: any) => p.cantidad > 0);

      if (lista.length === 0) {
        this.ionicService.mostrarAlerta('Error', 'No hay productos con cantidad mayor a 0 para registrar la compra.');
        return;
      }

      const pedidoRef = await this.crearPedido(uid, direccion, lista, detallesPago);

      await this.insertarDetallesYActualizarStock(pedidoRef.id, lista);

      const porVendedor = this.agruparPorVendedor(lista);

      await this.insertarVentasPorVendedor(porVendedor, pedidoRef.id, uid);

      await this.authService.actualizarRecomendadosUsuario(lista);
      this.ionicService.mostrarAlerta('Compra exitosa', 'Compra registrada con éxito.');
    } catch (error: any) {
      this.ionicService.mostrarAlerta('Error', `Error al registrar la compra: ${error}`);
    }
  }

  async crearPedido(uid: string, direccion: any, lista: any[], detallesPago: any) {
    const pedidoRef = await addDoc(collection(this.firestore, 'pedidos'), {
      usuario_id: uid,
      fecha_creacion: new Date(),
      total_pagado: this.calcularTotal(lista),
      total_comision: this.calcularComision(lista),
      descripcion: direccion.descripcion,
      comuna: direccion.comuna,
      region: direccion.region,
      departamento: direccion.departamento || null,
      nombres: direccion.nombres,
      numero: direccion.numero,
      apellidos: direccion.apellidos,
      telefono: direccion.apellidos,
      calle: direccion.calle,
      estado_pago: detallesPago.status,
      medio_pago: detallesPago.payment_type_code
    });
    console.log('Funcion crearPedido Exito');
    return pedidoRef;
  }

  async insertarDetallesYActualizarStock(pedido_id: string, lista: any[]) {
    for (const producto of lista) {
      const precio = producto.precio_oferta || producto.precio;
      const total = (precio * producto.cantidad) + producto.costo_envio;
      const comision = total * 0.1;

      await addDoc(collection(this.firestore, `pedidos/${pedido_id}/detalle`), {
        pedido_id: pedido_id,
        vendedor_id: producto.vendedor_id,
        producto_id: producto.producto_id,
        producto_titulo: producto.producto_titulo,
        cantidad: producto.cantidad,
        valor_unitario: precio,
        valor_total: total,
        subtotal: total - comision,
        valor_comision: comision,
        estado_envio: 'pendiente',
        costo_envio: producto.costo_envio,
        fecha_recepcion: null,
        numero_seguimiento: `${pedido_id}${producto.producto_id}`,
      });

      const productoRef = doc(this.firestore, `productos/${producto.producto_id}`);
      const productoSnap = await this.crudService.obtenerDetalleProducto(producto.producto_id);
      const stockActual = productoSnap?.stock ?? 0;
      const nuevoStock = stockActual - producto.cantidad;
      if (nuevoStock < 0) {
        this.ionicService.mostrarAlerta('Error', `Stock insuficiente para el producto ${producto.producto_id}`);
        throw new Error(`Stock insuficiente para el producto ${producto.producto_id}`);
      }
      console.log('Funcion insertarDetallesYActualizarStock Exito');
      await setDoc(productoRef, { stock: nuevoStock }, { merge: true });
    }
  }

  agruparPorVendedor(lista: any[]): Record<string, any[]> {
    const porVendedor: Record<string, any[]> = {};
    for (const producto of lista) {
      const vendedor_id = producto.vendedor_id;
      const precio = producto.precio_oferta || producto.precio;
      const total = precio * producto.cantidad;
      const comision = total * 0.1;

      if (!porVendedor[vendedor_id]) {
        porVendedor[vendedor_id] = [];
      }

      porVendedor[vendedor_id].push({
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
    const ubicacionActual = this.ubicacionService.getRegionComunaActual();
    
    if (!ubicacionActual) {
      return 5000; // Costo por defecto si no hay ubicación seleccionada
    }

    // Costo base según la región
    let costoBase = 3000; // RM
    switch(ubicacionActual.region) {
      case 'Valparaíso':
      case 'O\'Higgins':
        costoBase = 3500;
        break;
      case 'Maule':
      case 'Ñuble':
      case 'Biobío':
        costoBase = 4000;
        break;
      case 'La Araucanía':
      case 'Los Ríos':
      case 'Los Lagos':
        costoBase = 4500;
        break;
      case 'Aysén':
      case 'Magallanes':
        costoBase = 6000;
        break;
      // Regiones del norte
      case 'Arica y Parinacota':
      case 'Tarapacá':
      case 'Antofagasta':
      case 'Atacama':
      case 'Coquimbo':
        costoBase = 5000;
        break;
    }

    // Ajustes por comuna específica
    if (ubicacionActual.comuna.includes('Santiago') || 
        ubicacionActual.comuna.includes('Providencia') ||
        ubicacionActual.comuna.includes('Las Condes')) {
      costoBase += 500; // Zonas céntricas pueden tener recargo
    }

    // Factor de peso/tamaño (simulado)
    const factorPeso = 1.0;

    return costoBase * factorPeso * producto.cantidad;
  }
  
}