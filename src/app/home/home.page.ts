import { Categoria } from 'src/app/models/categoria.models';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../services/crud/crud.service';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  usuario?: any;
  productosRecomendados?: Observable<any[]>;
  productosGenerales!: Observable<any[]>;
  productosConOferta!: Observable<any[]>;
  hayRecomendados?: Observable<boolean>;
  hayProductos!: Observable<boolean>;
  hayOfertas!: Observable<boolean>;
  categorias!: Observable<any[]>;

  constructor( private router: Router, private crudService: CrudService, private authService : AuthService ) { }

  async ngOnInit() {
    this.usuario = await this.authService.obtenerPerfil();
    if (this.usuario){
      this.productosRecomendados = this.crudService.obtenerProductosRecomendados();
      this.hayRecomendados = this.productosRecomendados.pipe(map((productos) => productos.length > 0));
    }

    this.productosGenerales = this.crudService.obtenerProductosYOferta();
    this.productosConOferta = this.crudService.obtenerProductosConOferta();
    this.hayProductos = this.productosGenerales.pipe(map((productos) => productos.length > 0));
    this.hayOfertas = this.productosConOferta.pipe(map((productos) => productos.length > 0));
    this.categorias = this.crudService.obtenerCategorias();    

    // this.productosSinOferta.slice(0, 6);
    // this.productosConOferta = this.productosConOferta.slice(0, 6);
  }

  verCategoria(categoria: string){
    this.router.navigate(['/busqueda'], { state: { categoria : categoria } });
  }

  verMas(tipoProducto: string) {
    this.router.navigate(['/busqueda'], { state: { productos: tipoProducto } });    
  }

  verDetalle(producto_id: string) {
    this.router.navigate(['/producto'], { state: { producto_id } });
  }

}
