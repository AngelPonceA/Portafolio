import { AuthService } from 'src/app/services/auth/auth.service';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-boton-soporte',
  templateUrl: './boton-soporte.component.html',
  styleUrls: ['./boton-soporte.component.scss'],
  standalone: false,
})
export class BotonSoporteComponent implements OnInit, AfterViewInit {
  private posicionado = false;
  usuario: any;

  @ViewChild('fabButton', { static: true }) fabButton!: ElementRef;

  constructor(
    private navCtrl: NavController,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.posicionado = false;
        setTimeout(() => this.resetPosition(), 300);
      }
    });
  }

  ngOnInit() {}

  async ngAfterViewInit() {
    this.resetPosition();
    this.usuario = await this.authService.obtenerPerfil();
  }

  private resetPosition() {
    const rutaActual = this.router.url;

    if (rutaActual === '/perfil') {
      let intentos = 0;
      const maxIntentos = 30;

      const intentarColocarFab = () => {
        const fabPerfil = document.getElementById('fabPerfil');
        if (fabPerfil) {
          const rect = fabPerfil.getBoundingClientRect();
          const esValido = rect.width > 0 && rect.height > 0 && rect.top > 0 && rect.left > 0;

          if (esValido) {
            const botonWidth = rect.width;
            const mirroredX = window.innerWidth - rect.left - botonWidth;
            const topY = rect.top;

            const maxLeft = window.innerWidth - botonWidth;
            const posXFinal = Math.max(0, Math.min(mirroredX, maxLeft));

            // Posicionar el FAB soporte en espejo
            this.renderer.setStyle(this.el.nativeElement, 'left', `${posXFinal}px`);
            this.renderer.setStyle(this.el.nativeElement, 'top', `${topY}px`);
            this.renderer.setStyle(this.el.nativeElement, 'right', 'auto');
            this.renderer.setStyle(this.el.nativeElement, 'bottom', 'auto');
            this.renderer.setStyle(this.el.nativeElement, 'position', 'fixed');
            this.renderer.setStyle(this.el.nativeElement, 'z-index', '9999');
            this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');

          } else {
            if (intentos < maxIntentos) {
              intentos++;
              setTimeout(intentarColocarFab, 100);
            } else {
              console.warn('❌ No se pudo calcular la posición del FAB perfil tras múltiples intentos.');
            }
          }
        } else {
          if (intentos < maxIntentos) {
            intentos++;
            setTimeout(intentarColocarFab, 100);
          }
        }
      };

      intentarColocarFab();
    } else {
      const defaultX = window.innerWidth * 0.8;
      const defaultY = window.innerHeight * 0.84;

      this.renderer.setStyle(this.el.nativeElement, 'left', `${defaultX}px`);
      this.renderer.setStyle(this.el.nativeElement, 'top', `${defaultY}px`);
      this.renderer.setStyle(this.el.nativeElement, 'right', 'auto');
      this.renderer.setStyle(this.el.nativeElement, 'bottom', 'auto');
      this.renderer.setStyle(this.el.nativeElement, 'position', 'fixed');
      this.renderer.setStyle(this.el.nativeElement, 'z-index', '9999');
      this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
    }
  }

  goToSoporte() {
    this.navCtrl.navigateForward('/soporte');
  }
}
