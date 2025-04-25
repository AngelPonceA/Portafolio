export interface Variante {
    id: string;
    oferta_id?: string;
    atributo: string;
    estado: string;
    precio: number;
    producto_id: string;
    sku: string;
    stock: number;
    inventario_minimo: number;
    auto_stock: boolean;
    imagen: string[];

}