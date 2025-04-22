import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '../services/crud/crud.service';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto.models';
import { ProductoExtendido } from '../models/producto_ext.models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  productosSinOferta!: Observable<any[]>;
  productosConOferta!: Observable<any[]>;

  // productos = [
  //   { nombre: 'Botas', contacto: '+56920041440', descripcion: 'Botas re wenas', precio: 50000, oferta: 50, ID: 1, stock: 3, etiquetas: ['calzado', 'hombre'], imagenes: ['https://imgs.search.brave.com/VUlm4eamkknVVPCZ1wIZRKifh8YVPS19JnhzVf8_EiA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jYXRl/cnBpbGxhcnN2LmNv/bS9jZG4vc2hvcC9m/aWxlcy8zMDA3MTA2/Nl80MDY1NmEwMC05/NDFiLTQ1YWMtOTU5/Ny05Mzc1MTAyMmMx/MmFfMTAyNHgxMDI0/LmpwZz92PTE3NDA3/MjcxNzk'] },
  //   { nombre: 'Celular', contacto: '+56920041440', descripcion: 'Celuo nueo', precio: 250000, oferta: 10, ID: 2, stock: 17, etiquetas: ['android', ], imagenes: ['https://imgs.search.brave.com/T2jytlLQiDVVUGCnxBwmbRg2NU5wbKr1395U1SOV6q4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzcxNG9WR0p0V2VM/LmpwZw'] },
  //   { nombre: 'Poleron', contacto: '+56920041440', descripcion: 'Poleron pal frio', precio: 2000, oferta: 0, ID: 3, stock: 1, etiquetas: ['ropa', 'adulto'], imagenes: ['https://imgs.search.brave.com/VyKZIQ3m5ohULpl5dZ2poYoKghRCHJ_1qNRyoj0HsVc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/a2xpcGVyLmNsL21l/ZGlhL2NhdGFsb2cv/cHJvZHVjdC9sL2Ev/bGFkeXNmMDMwNzdf/a3ZqMF8xLmpwZz9v/cHRpbWl6ZT1tZWRp/dW0mYmctY29sb3I9/MjU1LDI1NSwyNTUm/Zml0PWJvdW5kcyZo/ZWlnaHQ9NDE1Jndp/ZHRoPTM1NiZjYW52/YXM9MzU2OjQxNQ'] },
  // ];

  constructor( private router: Router, private crudService: CrudService ) { }

  ngOnInit() {
    this.productosSinOferta = this.crudService.obtenerProductosSinOferta();
    this.productosConOferta = this.crudService.obtenerProductosConOferta();

    // this.productosSinOferta.slice(0, 6);
    // this.productosConOferta = this.productosConOferta.slice(0, 6);
  }


  verDetalle(item:any) {
    this.router.navigate(['/producto'], { state: { item } });
  }

}
