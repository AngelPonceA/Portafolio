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

  constructor(private router: Router, private crudService: CrudService, private authService: AuthService) {}
    
  async ngOnInit() {
    const variante_id = await this.router.getCurrentNavigation()?.extras?.state?.['variante_id'];
    if (variante_id) {
      this.crudService.obtenerDetalleVariante(variante_id).subscribe(data => {
        this.producto = data;        
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

  async ver(producto: string) {
    let x = await this.crudService.esFavorito(producto);
    console.log('estado ' + x);
    
  }

  async agregarFavorito(producto: string) {
    try {
      await this.crudService.agregarFavorito(producto);
      this.esFavorito = true;
      this.ver(producto);
    } catch (error) {
      console.error('Error al agregar favorito:', error);
    }
  }
  
  async eliminarFavorito(producto: string) {
    try {
      await this.crudService.eliminarFavorito(producto);
      this.esFavorito = false;
      this.ver(producto);
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
