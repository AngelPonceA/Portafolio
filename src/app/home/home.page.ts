import { Categoria } from 'src/app/models/categoria.models';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../services/crud/crud.service';
import { map, Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { IonicService } from '../services/ionic/ionic.service';

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
  productosInfinitos: any[] = [];
  cargando = false;
  sinMasProductos = false;


  constructor(  private router: Router, 
                private crudService: CrudService, 
                private authService : AuthService,
                private ionicService: IonicService
              ) { }

  async ionViewWillEnter() {
    this.cargarContenidoHome();
  }

  async cargarContenidoHome() {
    await this.ionicService.mostrarCargando('Cargando contenido...');

    try {
      await this.cargarMasProductos(); // ← ahora sí espera

      this.usuario = await this.authService.obtenerPerfil();

      if (this.usuario) {
        this.productosRecomendados = this.crudService.obtenerProductosRecomendados().pipe(
          map(productos => productos.slice(0, 8))
        );
        this.hayRecomendados = this.productosRecomendados.pipe(
          map((productos) => productos.length > 0)
        );
      }

      this.productosConOferta = this.crudService.obtenerProductosConOferta().pipe(
        map(productos => productos.slice(0, 8))
      );

      this.productosGenerales = this.crudService.obtenerProductosYOferta().pipe(
        map(productos => productos.slice(0, 8))
      );

      this.hayProductos = this.productosGenerales.pipe(
        map((productos) => productos.length > 0)
      );

      this.hayOfertas = this.productosConOferta.pipe(
        map((productos) => productos.length > 0)
      );

      this.categorias = this.crudService.obtenerCategorias();
    } catch (error) {
      console.error('Error al cargar contenido de la home:', error);
    } finally {
      await this.ionicService.ocultarCargando();
    }
  }


  async ionViewDidEnter() {
    this.productosInfinitos = [];
    await this.cargarMasProductos();
  }

  async cargarMasProductos() {
    if (this.cargando || this.sinMasProductos) return;
    this.cargando = true;

    try {
      const idsMostrados = this.productosInfinitos.map(p => p.producto_id);
      const nuevos = await this.crudService.obtenerProductosAleatorios(10, idsMostrados);

      if (nuevos.length === 0) {
        console.log('No hay más productos únicos disponibles.');
        this.sinMasProductos = true;
        return;
      }

      this.productosInfinitos.push(...nuevos);
    } catch (err) {
      console.error('Error cargando productos aleatorios:', err);
    } finally {
      this.cargando = false;
    }
  }

  entero(calificacion: number){
    return Math.floor(calificacion || 0);
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

  async cargarMas(event: any) {
    try {
      await this.cargarMasProductos();
    } catch (error) {
      console.error('Error al cargar más productos:', error);
    } finally {
      event.target.complete();
    }
  }

}
