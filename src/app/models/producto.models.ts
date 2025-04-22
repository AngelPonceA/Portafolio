export interface Producto {
    id: string;
    usuario_id: string;
    categoria_id: string;
    titulo: string;
    descripcion: string;
    estado: string;
    imagenes: string[];
    etiquetas: string[];
}