import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
  standalone: false
})
export class BusquedaPage implements OnInit {

  productos!: Observable<any[]>;
  hayProductos!: Observable<boolean>;
  categoria!: string;

  constructor(private router: Router, private crudService: CrudService) { }

  ngOnInit() {
    const categoria = this.router.getCurrentNavigation()?.extras?.state?.['categoria'];
    if (categoria) {
      this.productos = this.crudService.obtenerProductosCategoria(categoria);
      this.categoria = categoria;
    }

    this.hayProductos = this.productos.pipe(map((productos) => productos.length > 0));
  }

  verDetalle(variante_id: string){
    this.router.navigate(['/producto'], { state: { variante_id } });
  }

}
