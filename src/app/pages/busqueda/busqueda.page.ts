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
  busqueda!: string;

  constructor(private router: Router, private crudService: CrudService) { }

  ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras?.state;
    if (state?.['categoria']) {
      this.productos = this.crudService.obtenerProductosCategoria(state['categoria']);
      this.busqueda = state['categoria'];
      this.hayProductos = this.productos.pipe(map((productos) => productos.length > 0));
    } else if (state?.['busqueda']) {
      console.log('Por implementar');
      
    }

  }

  verDetalle(producto_id: string){
    this.router.navigate(['/producto'], { state: { producto_id } });
  }

}
