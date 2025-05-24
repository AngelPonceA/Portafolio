import { reload } from '@angular/fire/auth';
import { Producto } from './../../models/producto.models';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { CrudService } from 'src/app/services/crud/crud.service';

declare const paypal: any;

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: false
})

export class ProductoPage implements OnInit {

  producto?: any;
  favoritos: any[] = [];
  esFavorito?: any;
  cantidadOpciones: number[] = [];
  opcionStock: number = 1;
  mostrarPaypal: boolean = false;

  constructor(private router: Router, private crudService: CrudService, private authService: AuthService, private cartService: CarritoService) {}
    
  async ngOnInit() {
    const producto_id = await this.router.getCurrentNavigation()?.extras?.state?.['producto_id'];
    if (producto_id) {
      this.crudService.obtenerDetalleProducto(producto_id).then(data => {
        this.producto = data;    
        this.cantidadOpciones = Array.from({ length: this.producto.stock }, (_, i) => i + 1);
      });
      this.esFavorito = await this.crudService.esFavorito(producto_id);
    }
  }

  calcularTotal(){
    this.producto.cantidad = this.opcionStock;
    let total = ( this.producto.precio_oferta || this.producto.precio ) * this.producto.cantidad;
    return total;
  }

  mensajeWhatsApp(){
    this.authService.obtenerNumeroVendedor(this.producto.vendedor_id).then(telefono => {
      const url = `https://wa.me/${telefono}?text=Hola, tengo interés en su producto`;
      window.open(url, '_blank');
    });
  }

  cambiarOpcion(stock: number){
    this.calcularTotal();
  }

  async agregarFavorito(producto_id: string) {
    try {
      await this.crudService.agregarFavorito(producto_id);
      this.esFavorito = true;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
    }
  }

  iniciarBotonPaypal() {

    if (this.mostrarPaypal == false) {
      this.mostrarPaypal = true;
    } else return

    this.producto.cantidad = this.opcionStock;

    const total = (this.producto.precio_oferta || this.producto.precio) * this.opcionStock;

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            { amount: {
                value: (total / 1000).toFixed(2),
                currency_code: 'USD',
              },
            },
          ],
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          this.cartService.registrarCompra(this.producto, details);
          console.log('Pago exitoso:', details);
        });
      },
      onError: (err: any) => {
        console.error('Error durante el pago:', err);
        alert('Ocurrió un error al procesar el pago. Por favor intenta nuevamente.');
      },
    }).render('#paypal-button-container');
  }

  agregarAlCarrito(producto_id: string) {
  }

  async eliminarFavorito(producto_id: string) {
    try {
      await this.crudService.eliminarFavorito(producto_id);
      this.esFavorito = false;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
    }
  }

  async manejarFavorito(producto: any) {
      if (this.esFavorito) {
        const favorito_id = await this.crudService.obtenerFavoritoId(producto.producto_id);
        if (favorito_id) {
          await this.crudService.eliminarFavorito(favorito_id);
        }
        this.esFavorito = false;
      } else {
        await this.crudService.agregarFavorito(producto.producto_id);
        this.esFavorito = true;
      }
    }
  
}
