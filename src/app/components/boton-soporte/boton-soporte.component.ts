import {
  Component,
  ElementRef,
  HostListener,
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
  standalone: false
})
export class BotonSoporteComponent implements OnInit, AfterViewInit {
  private dragging = false;
  private offsetX = 0;
  private offsetY = 0;

  @ViewChild('fabButton', { static: true }) fabButton!: ElementRef;

  constructor(
    private navCtrl: NavController,
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router
  ) {
    // 💡 Resetear posición en cada navegación
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => this.resetPosition(), 10);
      }
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.resetPosition();
  }

  private resetPosition() {
    const defaultX = window.innerWidth * 0.8;
    const defaultY = window.innerHeight * 0.84;

    this.renderer.setStyle(this.el.nativeElement, 'left', `${defaultX}px`);
    this.renderer.setStyle(this.el.nativeElement, 'top', `${defaultY}px`);
    this.renderer.setStyle(this.el.nativeElement, 'bottom', 'auto');
    this.renderer.setStyle(this.el.nativeElement, 'right', 'auto');
    this.renderer.setStyle(this.el.nativeElement, 'position', 'fixed');
  }

  goToSoporte() {
    this.navCtrl.navigateForward('/soporte');
  }

  // // DRAG START
  // @HostListener('document:touchstart', ['$event'])
  // onTouchStart(event: TouchEvent) {
  //   const touch = event.touches[0];
  //   this.startDrag(touch.clientX, touch.clientY);
  // }

  // @HostListener('document:mousedown', ['$event'])
  // onMouseDown(event: MouseEvent) {
  //   if (event.button !== 0) return;
  //   this.startDrag(event.clientX, event.clientY);
  // }

  // // DRAG MOVE
  // @HostListener('document:touchmove', ['$event'])
  // onTouchMove(event: TouchEvent) {
  //   if (!this.dragging) return;
  //   const touch = event.touches[0];
  //   this.dragTo(touch.clientX, touch.clientY);
  // }

  // @HostListener('document:mousemove', ['$event'])
  // onMouseMove(event: MouseEvent) {
  //   if (!this.dragging) return;
  //   this.dragTo(event.clientX, event.clientY);
  // }

  // // DRAG END
  // @HostListener('document:touchend')
  // @HostListener('document:mouseup')
  // onEndDrag() {
  //   this.endDrag();
  // }

  // private startDrag(clientX: number, clientY: number) {
  //   const rect = this.el.nativeElement.getBoundingClientRect();
  //   this.dragging = true;
  //   this.offsetX = clientX - rect.left;
  //   this.offsetY = clientY - rect.top;
  //   this.el.nativeElement.classList.add('dragging');
  // }

  // private dragTo(clientX: number, clientY: number) {
  //   const el = this.el.nativeElement;
  //   const buttonRect = el.getBoundingClientRect();
  //   const buttonWidth = buttonRect.width;
  //   const buttonHeight = buttonRect.height;
  //   const screenWidth = window.innerWidth;
  //   const screenHeight = window.innerHeight;

  //   // Leer altura real de header/footer
  //   const header = document.querySelector('ion-header') as HTMLElement;
  //   const footer = document.querySelector('ion-footer') as HTMLElement;

  //   const headerHeight = header?.getBoundingClientRect().height || screenHeight * 0.08;
  //   const footerHeight = footer?.getBoundingClientRect().height || screenHeight * 0.08;

  //   const padding = 10;

  //   let x = clientX - this.offsetX;
  //   let y = clientY - this.offsetY;

  //   // Límites desde todos los bordes
  //   const minX = padding;
  //   const maxX = screenWidth - buttonWidth - padding * 8;
  //   const minY = headerHeight + padding;
  //   const maxY = screenHeight - footerHeight - buttonHeight - padding * 8;

  //   x = Math.max(minX, Math.min(x, maxX));
  //   y = Math.max(minY, Math.min(y, maxY));

  //   this.renderer.setStyle(el, 'left', `${x}px`);
  //   this.renderer.setStyle(el, 'top', `${y}px`);
  // }

  // private endDrag() {
  //   this.dragging = false;
  //   this.el.nativeElement.classList.remove('dragging');
  // }
}
