import { CrudService } from 'src/app/services/crud/crud.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage implements OnInit {

  usuario?: any;
  favoritos?: any[] = [];

  constructor( private crudService : CrudService, private router: Router, private authService: AuthService ) { }

  async ngOnInit() {
    this.usuario = await this.authService.obtenerPerfil()

    if (this.usuario) {
      this.crudService.obtenerFavoritosConDetalles(this.usuario.id).subscribe((favoritos) => {
        this.favoritos = favoritos;
      });
    }
  }

  verDetalle(producto_id: string) {
    this.router.navigate(['/producto'], { state: { producto_id } });
  }

  eliminarFavorito(favorito_id: string, event: Event) {
    event.stopPropagation();
    this.crudService.eliminarFavorito(favorito_id);
  }
  
}
