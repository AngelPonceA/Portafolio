import { CrudService } from 'src/app/services/crud/crud.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage implements OnInit {

  favoritos?: any[] = [];

  constructor( private crudService : CrudService, private router: Router ) { }

  ngOnInit() {
    this.crudService.obtenerFavoritosConDetalles().subscribe((favoritos) => {
      this.favoritos = favoritos;
    });
  }

  verDetalle(variante_id: string) {
    this.router.navigate(['/producto'], { state: { variante_id } });
  }

  eliminarFavorito(favorito_id: string, event: Event) {
    event.stopPropagation();
    this.crudService.eliminarFavorito(favorito_id);
  }
  
}
