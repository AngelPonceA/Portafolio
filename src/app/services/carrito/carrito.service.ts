import { CrudService } from './../crud/crud.service';
import { Injectable } from '@angular/core';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private carritoStorage = 'carrito';

  constructor( private nativeStorage: NativeStorage, private crudService: CrudService ) { }

  async agregarProducto(id: string, cantidad: number) {
    try {
      const producto = await this.crudService.buscarVarianteId(id);

      if (!producto) {
        console.error('Producto no encontrado.');
        return false;
      }

      const carrito = (await this.nativeStorage.getItem(this.carritoStorage)) || [];
      const productoExistente = carrito.find((item: any) => item.id === id);

      const cantidadTotal = productoExistente ? productoExistente.cantidad + cantidad : cantidad;

      if (cantidadTotal > producto.stock) {
        console.error('No se puede agregar más cantidad. Stock insuficiente.');
        return false;
      }

      // Agregar o actualizar el producto en el carrito
      if (productoExistente) {
        productoExistente.cantidad = cantidadTotal;
      } else {
        carrito.push({ id, cantidad });
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


}
