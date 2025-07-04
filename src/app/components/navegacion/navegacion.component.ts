import { Component, OnDestroy, OnInit } from '@angular/core';
//Imports acá abajo para no confundirnos
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CarritoService } from 'src/app/services/carrito/carrito.service';
import { Keyboard } from '@capacitor/keyboard'
import { Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navegacion',
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.scss'],
})
export class NavegacionComponent implements OnInit, OnDestroy {
  keyboardAbierto = false;
  usuario: any;
  notificaciones?: number ;
  carrito: number = 0;
  busqueda: string = '';
  sugerencias: any[] = [];
  carritoObservable?: Subscription;

  constructor(  private router: Router, private navCtrl: NavController, private authService: AuthService,
    private crudService: CrudService, private location: Location, private cartService: CarritoService,
    private renderer: Renderer2 ) { }
                
  async ngOnInit() {
    this.usuario = await this.authService.obtenerPerfil();
    
    if (this.usuario) {
      this.authService.obtenerNotificacionesNav(this.usuario.id).subscribe((notificacionesEntrantes) => {
        this.notificaciones = notificacionesEntrantes;    
      });
    }

    this.carritoObservable = this.cartService.obtenerCantidadCarritoObservable().subscribe(cantidad => {
      this.carrito = cantidad;
    });

    Keyboard.addListener('keyboardWillShow', () => {
      this.renderer.addClass(document.body, 'keyboard-is-open');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.renderer.removeClass(document.body, 'keyboard-is-open');
    });
    
  }
  
  ngOnDestroy() {
    if (this.carritoObservable) {
      this.carritoObservable.unsubscribe();
    }
  }
  
  enHome(): boolean {
    return this.router.url === '/home';
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
