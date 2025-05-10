import { descripcion } from './descripcion.models';

export interface productoFinal {
    usuario_id: string;
    categoria: string;
    titulo: string;
    descripcion: descripcion[];
    etiquetas: string[];
    oferta_id?: string;
    estado: string;
    precio: number;
    stock: number;
    inventario_minimo: number;
    auto_stock: boolean;
    imagen: string[];
}