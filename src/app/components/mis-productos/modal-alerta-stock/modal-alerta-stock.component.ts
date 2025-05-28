import {
  Component,
  Output,
  OnInit,
  EventEmitter,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  ModalController,
} from '@ionic/angular';

// Importar modelos
import { Producto } from 'src/app/models/producto.models';

// Importar servicios
import { CrudService } from 'src/app/services/crud/crud.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-modal-alerta-stock',
  templateUrl: './modal-alerta-stock.component.html',
  styleUrls: ['./modal-alerta-stock.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ModalAlertaStockComponent  implements OnInit {

  @Input() initialProductData!: Producto;
  @Output() alertaGuardada = new EventEmitter<Producto>();
  @Output() modalCerrado = new EventEmitter<void>();

  mostrarModalAutostock = false;
  productoParaAutostock: Producto | null = null;
  stockMinimo = 1;
  activarAutoStock = false;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService,
    private crudService: CrudService,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController
  ) { }

  ngOnInit() {}

    // Abrir modal y precargar valores
  abrirModalAutostock(producto: Producto) {
    this.productoParaAutostock = producto;
    this.stockMinimo = producto.inventario_minimo || 1;
    this.activarAutoStock = !!producto.auto_stock;
    this.mostrarModalAutostock = true;
  }

  async cerrarModal(actualizado = false) {
    await this.modalController.dismiss({
      actualizado,
    });
    this.modalCerrado.emit();
  }

  // Guardar cambios de AutoStock
  async guardarAutostock(form: NgForm) {
    if (form.invalid || !this.productoParaAutostock) {
      this.mostrarToast('Complete correctamente el formulario', 'warning');
      return;
    }

    const minimo = Number(this.stockMinimo);
    if (isNaN(minimo) || minimo < 1) {
      this.mostrarToast('El stock mínimo debe ser ≥ 1', 'warning');
      return;
    }

    this.productoParaAutostock.inventario_minimo = minimo;
    this.productoParaAutostock.auto_stock = this.activarAutoStock;

    try {
      await this.crudService.editarProducto(
        this.productoParaAutostock.producto_id!,
        {
          usuario_id: this.productoParaAutostock.usuario_id,
          inventario_minimo: minimo,
          auto_stock: this.activarAutoStock,
        } as Producto
      );
      this.mostrarToast('AutoStock configurado', 'success');
      this.cerrarModal(true);
      form.resetForm();
    } catch (err) {
      console.error('Error al guardar autostock:', err);
      this.mostrarToast('No se pudo configurar la alerta', 'danger');
      this.cerrarModal(false);
    }
  }

    async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color,
      buttons: [{ icon: 'close', role: 'cancel' }],
    });
    await toast.present();
  }
}
