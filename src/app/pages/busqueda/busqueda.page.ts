import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { CrudService } from 'src/app/services/crud/crud.service';
import { IonicService } from 'src/app/services/ionic/ionic.service';


@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
  standalone: false
})
export class BusquedaPage implements OnInit {

  productos!: Observable<any[]>;
  productosRespaldo!: Observable<any[]>;
  hayProductos!: Observable<boolean>;
  busqueda!: string;
  ordenActual: 'asc' | 'desc' | 'oferta' | 'nuevo' | 'segunda mano' | null = null;

  botonOferta: boolean = true;

  constructor(private router: Router, 
              private crudService: CrudService,
              private ionicService: IonicService) { }

  ngOnInit() {
    this.ionicService.mostrarCargando('Buscando productos...');

    const state = this.router.getCurrentNavigation()?.extras?.state;

    if (state?.['categoria']) {
      this.productos = this.crudService.obtenerProductosCategoria(state['categoria']).pipe(
        tap(() => this.ionicService.ocultarCargando())
      );
      this.busqueda = `Categoría: ${state['categoria']}`;
    } else if (state?.['busqueda']) {
      this.productos = this.crudService.buscarProductosPorNombre(state['busqueda']).pipe(
        tap(() => this.ionicService.ocultarCargando())
      );
      this.busqueda = `Busqueda: ${state['busqueda']}`;
    } else if (state?.['productos']) {
      if (state['productos'] === 'sinOferta') {
        this.productos = this.crudService.obtenerProductosYOferta().pipe(
          tap(() => this.ionicService.ocultarCargando())
        );
        this.busqueda = 'Todos los productos';
      } else if (state['productos'] === 'conOferta') {
        this.productos = this.crudService.obtenerProductosConOferta().pipe(
          tap(() => this.ionicService.ocultarCargando())
        );
        this.busqueda = 'Productos con oferta';
        this.botonOferta = false;
      } else if (state['productos'] === 'recomendados') {
        this.productos = this.crudService.obtenerProductosRecomendados().pipe(
          tap(() => this.ionicService.ocultarCargando())
        );
        this.busqueda = 'Productos recomendados';
      }
    }

    this.hayProductos = this.productos.pipe(map(productos => productos.length > 0));
    this.productosRespaldo = this.productos;

    window.addEventListener('actualizarBusqueda', (event: any) => {
      const nuevaBusqueda = event.detail;
      this.productos = this.crudService.buscarProductosPorNombre(nuevaBusqueda).pipe(
        tap(() => this.ionicService.ocultarCargando())
      );
      this.busqueda = `Busqueda: ${nuevaBusqueda}`;
      this.hayProductos = this.productos.pipe(map((productos) => productos.length > 0));
      this.ordenActual = null;
      this.botonOferta = true;
    });
  }

  verDetalle(producto_id: string){
    this.router.navigate(['/producto'], { state: { producto_id } });
  }

  entero(calificacion: number){
    return Math.floor(calificacion || 0);
  }

  ordenarPorPrecio(orden: 'asc' | 'desc') {
    if (this.ordenActual === orden) {
      this.ordenActual = null;
      this.productos = this.productosRespaldo;
      return;
    }
    this.ordenActual = orden;
    this.productos = this.productosRespaldo.pipe(
      map(productos => {
        return [...productos].sort((a, b) =>
          orden === 'asc'
            ? (a.oferta?.precio_oferta ?? a.precio) - (b.oferta?.precio_oferta ?? b.precio)
            : (b.oferta?.precio_oferta ?? b.precio) - (a.oferta?.precio_oferta ?? a.precio)
        );
      })
    );
  }

  ordenarPorOferta() {
    if (this.ordenActual === 'oferta') {
      this.ordenActual = null;
      this.productos = this.productosRespaldo;
      return;
    }
    this.ordenActual = 'oferta';
    this.productos = this.productosRespaldo.pipe(
      map(productos => {
        return [...productos].sort((a, b) => {
          if (a.oferta && !b.oferta) return -1;
          if (!a.oferta && b.oferta) return 1;
          return 0;
        });
      })
    );
  }

  ordenarPorCondicion(orden: 'nuevo' | 'segunda mano') {
    if (this.ordenActual === orden) {
      this.ordenActual = null;
      this.productos = this.productosRespaldo;
      return;
    }

    this.ordenActual = orden;
    this.productos = this.productosRespaldo.pipe(
      map(productos => {
        return [...productos].sort((a, b) => {
          if (a.estado === orden && b.estado !== orden) return -1;
          if (a.estado !== orden && b.estado === orden) return 1;
          return 0;
        });
      })
    );
  }

}
