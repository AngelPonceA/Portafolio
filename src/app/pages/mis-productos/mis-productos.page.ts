import { Component } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';

interface ProductoLocal {
  id: string;
  usuario_id: string;
  categoria_id: string;
  titulo: string;
  descripcion: string;
  etiquetas: string[];
  estado: string;
  stock: number;
  precio: number;
  precioOferta: number | null;
  imagenes: string[];
  fechaCreacion: Date;
}

@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
  standalone: false
})
export class MisProductosPage {

  productos: ProductoLocal[] = [];
  mostrarModal = false;
  editarIndice: number | null = null;

  nuevoProducto: ProductoLocal = this.inicializarProducto();
  categorias = ['Electrónica', 'Ropa', 'Muebles', 'Alimentos'];
  etiquetas = ['Nuevo', 'Rebaja', 'Exclusivo', 'Popular'];
  estados = ['nuevo', 'segunda mano'];
  mostrarCampoCategoria = false;
  mostrarCampoEtiqueta = false;
  oferta = false;
  cargando = false;

  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.cargarProductos();
  }


  inicializarProducto(): ProductoLocal {
    return {
      id: this.generarId(),
      usuario_id: 'usuario-1',
      categoria_id: '',
      titulo: '',
      descripcion: '',
      etiquetas: [],
      estado: 'nuevo',
      stock: 0,
      precio: 0,
      precioOferta: null,
      imagenes: ['assets/img/placeholder.png'],
      fechaCreacion: new Date()
    };
  }

  generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  async guardarProducto() {
    if (!this.validarProducto()) return;

    this.cargando = true;
    try {
      if (this.editarIndice !== null) {
        this.productos[this.editarIndice] = { ...this.nuevoProducto };
        await this.mostrarToast('Producto actualizado con éxito');
      } else {
        this.productos.unshift({ ...this.nuevoProducto });
        await this.mostrarToast('Producto agregado con éxito');
      }
      this.guardarProductos();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      await this.mostrarToast('Error al guardar el producto', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  validarProducto(): boolean {
    if (!this.nuevoProducto.titulo.trim() || this.nuevoProducto.titulo.length < 3) {
      this.mostrarToast('El título debe tener al menos 3 caracteres', 'warning');
      return false;
    }
    if (this.nuevoProducto.precio <= 0) {
      this.mostrarToast('El precio debe ser mayor a 0', 'warning');
      return false;
    }
    if (this.oferta && (!this.nuevoProducto.precioOferta || this.nuevoProducto.precioOferta <= 0)) {
      this.mostrarToast('El precio de oferta debe ser mayor a 0', 'warning');
      return false;
    }
    if (!this.nuevoProducto.categoria_id) {
      this.mostrarToast('Debes seleccionar una categoría', 'warning');
      return false;
    }
    if (this.nuevoProducto.stock < 0) {
      this.mostrarToast('El stock no puede ser negativo', 'warning');
      return false;
    }
    return true;
  }

  editarProducto(indice: number) {
    this.nuevoProducto = { ...this.productos[indice] };
    this.oferta = !!this.nuevoProducto.precioOferta;
    this.editarIndice = indice;
    this.abrirModal();
  }

  async eliminarProducto(indice: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este producto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.productos.splice(indice, 1);
            this.guardarProductos();
            this.mostrarToast('Producto eliminado correctamente');
          }
        }
      ]
    });
    await alert.present();
  }


  // categoria y etiqueta
  toggleCampoCategoria() {
    this.mostrarCampoCategoria = !this.mostrarCampoCategoria;
    if (this.mostrarCampoCategoria) this.mostrarCampoEtiqueta = false;
  }

  toggleCampoEtiqueta() {
    this.mostrarCampoEtiqueta = !this.mostrarCampoEtiqueta;
    if (this.mostrarCampoEtiqueta) this.mostrarCampoCategoria = false;
  }

  // autoStock
  async activarAutostock(indice: number) {
    const alert = await this.alertController.create({
      header: 'Configurar Alerta de Stock',
      subHeader: `Stock actual: ${this.productos[indice].stock}`,
      inputs: [{ name: 'minStock', type: 'number', placeholder: 'Stock mínimo deseado', min: '1', value: '5' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const minStock = Number(data.minStock);
            this.mostrarToast(
              this.productos[indice].stock <= minStock
                ? `¡ALERTA! Stock bajo (${this.productos[indice].stock} unidades)`
                : `Stock suficiente (${this.productos[indice].stock} unidades)`,
              this.productos[indice].stock <= minStock ? 'warning' : 'success'
            );
          }
        }
      ]
    });
    await alert.present();
  }
  
  // Modal
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.nuevoProducto = this.inicializarProducto();
    this.oferta = false;
    this.editarIndice = null;
    this.mostrarCampoCategoria = false;
    this.mostrarCampoEtiqueta = false;
  }

  // localStorage
  guardarProductos() {
    try {
      localStorage.setItem('productos_metadata', JSON.stringify(this.productos));
    } catch (error) {
      console.error('Error al guardar productos:', error);
      this.mostrarToast('Error al guardar los productos', 'danger');
    }
  }

  cargarProductos() {
    try {
      const data = localStorage.getItem('productos_metadata');
      if (data) this.productos = JSON.parse(data) as ProductoLocal[];
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.mostrarToast('Error al cargar los productos', 'danger');
    }
  }

  // toast
  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color,
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  formularioValido(): boolean {
    return (
      this.nuevoProducto.titulo.trim().length > 0 &&
      this.nuevoProducto.precio > 0 &&
      this.nuevoProducto.stock >= 0 &&
      this.nuevoProducto.categoria_id !== '' &&
      (!this.oferta || (this.nuevoProducto.precioOferta !== null && this.nuevoProducto.precioOferta > 0))
    );
  }
}
