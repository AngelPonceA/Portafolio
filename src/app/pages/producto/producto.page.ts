import { Producto } from './../../models/producto.models';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';

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
  
  constructor(private router: Router, private crudService: CrudService, private authService: AuthService) {}
    
  async ngOnInit() {
    const variante_id = await this.router.getCurrentNavigation()?.extras?.state?.['variante_id'];
    if (variante_id) {
      this.crudService.obtenerDetalleVariante(variante_id).then(data => {
        this.producto = data;    
        this.cantidadOpciones = Array.from({ length: this.producto.stock }, (_, i) => i + 1);
      });
      this.esFavorito = await this.crudService.esFavorito(variante_id);
    }
  }

  mensajeWhatsApp(){
    this.authService.obtenerNumeroVendedor(this.producto.usuario_id).then(telefono => {
      const url = `https://wa.me/${telefono}?text=Hola, tengo interés en su producto`;
      window.open(url, '_blank');
    });
  }

  mostrar(){
    console.log(this.opcionStock);
    setInterval(() => this.mostrar(), 20000);
  }

  cambiarOpcion(stock: number){
    this.opcionStock = stock;
  }

  async agregarFavorito(producto: string) {
    try {
      await this.crudService.agregarFavorito(producto);
      this.esFavorito = true;
    } catch (error) {
      console.error('Error al agregar favorito:', error);
    }
  }

  agregarAlCarrito(producto: string) {

  }
  
  async eliminarFavorito(producto: string) {
    try {
      await this.crudService.eliminarFavorito(producto);
      this.esFavorito = false;
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
    }
  }

  async manejarFavorito(producto: any) {
      if (this.esFavorito) {
        const favorito_id = await this.crudService.obtenerFavoritoId(producto.variante_id);
        if (favorito_id) {
          await this.crudService.eliminarFavorito(favorito_id);
        }
        this.esFavorito = false;
      } else {
        await this.crudService.agregarFavorito(producto.variante_id);
        this.esFavorito = true;
      }
    }
  
}
