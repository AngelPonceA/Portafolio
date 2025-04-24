import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: false
})

export class ProductoPage implements OnInit {

  item?: any;
  contacto?: number;
  favoritos: any[] = [];

  constructor(private router: Router, private crudService: CrudService) {

    const nav = this.router.getCurrentNavigation();
    this.item = nav?.extras.state?.['item'];
    
  }
    
    ngOnInit() {
    }

    mensajeWhatsApp(usuario_id: string){
      this.crudService.obtenerContactoID(this.item.producto.usuario_id).then(telefono => {
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
