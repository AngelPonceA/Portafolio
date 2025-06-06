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
  ordenActual: 'asc' | 'desc' | 'oferta' | null = null;
  botonOferta: boolean = true;

  constructor(private router: Router, private crudService: CrudService) { }

  ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras?.state;
    if (state?.['categoria']) {
      this.productos = this.crudService.obtenerProductosCategoria(state['categoria']);
      this.busqueda = `Categoría: ${state['categoria']}`;
      this.hayProductos = this.productos.pipe(map((productos) => productos.length > 0));
    } else if (state?.['busqueda']) {
      this.productos = this.crudService.buscarProductosPorNombre(state['busqueda']);
      this.busqueda = `Busqueda: ${state['busqueda']}`;
      this.hayProductos = this.productos.pipe(map((productos) => productos.length > 0));
    } else if (state?.['productos']) {
      if (state['productos'] == 'sinOferta') {
        this.productos = this.crudService.obtenerProductosYOferta();
        this.busqueda = 'Todos los productos';
        this.hayProductos = this.productos.pipe(map((productos) => productos.length > 0));
      } else if (state['productos'] == 'conOferta') {
        this.productos = this.crudService.obtenerProductosConOferta();
        this.busqueda = 'Productos con oferta';
        this.botonOferta = false;
        this.hayProductos = this.productos.pipe(map((productos) => productos.length > 0));
      }
    }

    window.addEventListener('actualizarBusqueda', (event: any) => {
      const nuevaBusqueda = event.detail;
      this.productos = this.crudService.buscarProductosPorNombre(nuevaBusqueda);
      this.busqueda = `Busqueda: ${nuevaBusqueda}`;
      this.hayProductos = this.productos.pipe(map((productos) => productos.length > 0));
      this.ordenActual = null;
      this.botonOferta = true;
    });
  }

  verDetalle(producto_id: string){
    this.router.navigate(['/producto'], { state: { producto_id } });
  }

  ordenarPorPrecio(orden: 'asc' | 'desc') {
    this.ordenActual = orden;
    this.productos = this.productos.pipe(
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
    if (this.ordenActual === 'oferta') return; 
    this.ordenActual = 'oferta';
    this.productos = this.productos.pipe(
      map(productos => {
        return [...productos].sort((a, b) => {
          if (a.oferta && !b.oferta) return -1;
          if (!a.oferta && b.oferta) return 1;
          return 0;
        });
      })
    );
  }

}
