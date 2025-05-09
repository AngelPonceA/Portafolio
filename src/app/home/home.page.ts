import { Categoria } from 'src/app/models/categoria.models';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../services/crud/crud.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  productosSinOferta!: Observable<any[]>;
  productosConOferta!: Observable<any[]>;
  categorias!: Observable<any[]>;

  constructor( private router: Router, private crudService: CrudService ) { }

  ngOnInit() {
    this.productosSinOferta = this.crudService.obtenerProductosSinOferta();
    this.productosConOferta = this.crudService.obtenerProductosConOferta();
    this.categorias = this.crudService.obtenerCategorias();    

    // this.productosSinOferta.slice(0, 6);
    // this.productosConOferta = this.productosConOferta.slice(0, 6);
    //Token DHL al iniciar la aplicacion
  }

  verCategoria(categoria: string){
    this.router.navigate(['/busqueda'], { state: { categoria } });    
  }

  verDetalle(variante_id: string) {
    this.router.navigate(['/producto'], { state: { variante_id } });
  }

}
