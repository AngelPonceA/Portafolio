export interface ProductoBoleta {
    nombre: string;
    precio: number;
    cantidad: number;
    costo_envio: number;
    direccion_origen?: {
    comuna: string;
    region: string;
};
}