import { Calificacion } from './calificacion.models';
import { Direccion } from './direccion.models';
import { Oferta } from './oferta.models';

export interface Producto {
    producto_id?: string;
    usuario_id: string;
    categoria: string;
    titulo: string;
    descripcion: string;
    etiquetas: string[];
    estado: string;
    precio: number;
    stock: number;
    inventario_minimo: number;
    auto_stock: boolean;
    imagen: string[];
    oferta?: Oferta;
    calificacion?: Calificacion[] | number;
    esta_eliminado?: boolean;
    direccionOrigen?: Direccion
}