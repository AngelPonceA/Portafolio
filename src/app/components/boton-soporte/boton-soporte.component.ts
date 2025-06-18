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

@Component({
  selector: 'app-boton-soporte',
  templateUrl: './boton-soporte.component.html',
  styleUrls: ['./boton-soporte.component.scss'],
  standalone: false,
})
export class BotonSoporteComponent implements OnInit, AfterViewInit {
  private dragging = false;
  private offsetX = 0;
  private offsetY = 0;

  @ViewChild('fabButton', { static: true }) fabButton!: ElementRef;

  constructor(
    private navCtrl: NavController,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    const x = window.innerWidth - 75;
    const y = window.innerHeight * 0.85;

    this.renderer.setStyle(this.el.nativeElement, 'left', `${x}px`);
    this.renderer.setStyle(this.el.nativeElement, 'top', `${y}px`);
    this.renderer.setStyle(this.el.nativeElement, 'bottom', 'auto');
    this.renderer.setStyle(this.el.nativeElement, 'right', 'auto');
    this.renderer.setStyle(this.el.nativeElement, 'position', 'fixed');
  }

  goToSoporte() {
    this.navCtrl.navigateForward('/soporte');
  }

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    this.startDrag(touch.clientX, touch.clientY);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.dragging) return;
    const touch = event.touches[0];
    this.dragTo(touch.clientX, touch.clientY);
  }

  @HostListener('document:touchend')
  onTouchEnd() {
    this.endDrag();
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;
    this.startDrag(event.clientX, event.clientY);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.dragging) return;
    this.dragTo(event.clientX, event.clientY);
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.endDrag();
  }

  private startDrag(clientX: number, clientY: number) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.dragging = true;
    this.offsetX = clientX - rect.left;
    this.offsetY = clientY - rect.top;
    this.el.nativeElement.classList.add('dragging');
  }

  private dragTo(clientX: number, clientY: number) {
    const el = this.el.nativeElement;
    const buttonEl = this.fabButton?.nativeElement ?? el;
    const buttonWidth = buttonEl.offsetWidth;
    const buttonHeight = buttonEl.offsetHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let x = clientX - this.offsetX;
    let y = clientY - this.offsetY;

    const padding = 10;
    const minX = padding;
    const maxX = screenWidth - buttonWidth - padding;
    const minY = padding;
    const maxY = screenHeight - buttonHeight - padding;

    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    this.renderer.setStyle(el, 'left', `${x}px`);
    this.renderer.setStyle(el, 'top', `${y}px`);
  }

  private endDrag() {
    this.dragging = false;
    this.el.nativeElement.classList.remove('dragging');
  }
}
