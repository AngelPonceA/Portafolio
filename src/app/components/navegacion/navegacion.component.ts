import { Component, OnInit } from '@angular/core';
//Imports acá abajo para no confundirnos
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-navegacion',
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.scss'],
})
export class NavegacionComponent  implements OnInit {

  notificaciones?: number ;
  carrito: number = 3;
  busqueda: string = '';
  sugerencias: any[] = [];

  constructor( private router: Router, private navCtrl: NavController, private authService: AuthService, private crudService: CrudService,
    private location: Location
   ) { }
  
  ngOnInit() {
    this.authService.obtenerNotificacionesNav().subscribe((notificacionesEntrantes) => {
      this.notificaciones = notificacionesEntrantes;    
    });
  }
  
    onInputChange(event: any) {
    const valor = event.detail.value;
    if (valor && valor.trim().length > 1) {
      this.crudService.buscarProductosPorNombre(valor.trim()).subscribe(productos => {
        this.sugerencias = productos.slice(0, 5);
      });
    } else {
      this.sugerencias = [];
    }
  }

  verDetalle(producto_id: string) {
      this.router.navigate(['/producto'], { state: { producto_id } });
    this.sugerencias = [];
  }
  
buscarProducto() {
  if (this.busqueda && this.busqueda.trim() !== '') {
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/busqueda')) {
      window.dispatchEvent(new CustomEvent('actualizarBusqueda', { detail: this.busqueda.trim() }));
    } else {
      this.router.navigate(['/busqueda'], { state: { busqueda: this.busqueda.trim() } });
    }
    this.sugerencias = [];
  }
}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  retroceder() {
    this.navCtrl.back();
  }  

}
