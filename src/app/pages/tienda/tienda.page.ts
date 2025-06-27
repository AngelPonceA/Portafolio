import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';

@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.page.html',
  styleUrls: ['./tienda.page.scss'],
  standalone: false
})
export class TiendaPage implements OnInit {

  tienda?: any;
  productos!: Observable<any[]>;
  productosRespaldo!: Observable<any[]>;
  hayProductos!: Observable<boolean>;
  ordenActual: 'asc' | 'desc' | 'oferta' | 'nuevo' | 'segunda mano' | null = null;

  constructor( private router: Router, private crudService: CrudService, private authService: AuthService ) { }

  async ngOnInit() {
    const tienda_id = this.router.getCurrentNavigation()?.extras?.state?.['tienda_id'];
    if (tienda_id) {
      this.tienda = await this.authService.obtenerDetallesTienda(tienda_id);
      if (this.tienda) {
        this.productos = this.crudService.obtenerProductosTienda(tienda_id);

        this.productosRespaldo = this.productos;    

        this.tienda.calificacion = await this.crudService.obtenerPromedioCalificacionTienda(tienda_id)

        this.hayProductos = this.productos.pipe(
          map((productos) => productos.length > 0)
        ); 
      }
    }
  }

  verDetalle(producto_id: string) {
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
