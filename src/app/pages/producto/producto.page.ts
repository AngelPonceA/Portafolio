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

  constructor(private router: Router, private crudService: CrudService, private authService: AuthService) {}
    
  ngOnInit() {
    const variante_id = this.router.getCurrentNavigation()?.extras?.state?.['variante_id'];
    if (variante_id) {
      this.crudService.obtenerDetalleVariante(variante_id).subscribe(data => {
        this.producto = data;        
      });
    }
  }

  mensajeWhatsApp(){
    this.authService.obtenerNumeroVendedor(this.producto.usuario_id).then(telefono => {
      const url = `https://wa.me/${telefono}?text=Hola, tengo interés en su producto`;
      window.open(url, '_blank');
    });
  }

  toggleFavorito(producto: any) {
    const index = this.favoritos.findIndex(item => item.id === producto.id);
    if (index === -1) {
      // Si no está en favoritos, lo agregamos
      this.favoritos.push(producto);
    } else {
      // Si ya está en favoritos, lo eliminamos
      this.favoritos.splice(index, 1);
    }
  }

  isFavorito(producto: any): boolean {
    return this.favoritos.some(item => item.id === producto.id);
  }
  
}
