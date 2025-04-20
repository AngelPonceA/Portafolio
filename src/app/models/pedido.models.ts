export interface Pedido {
    id: string;
    estado: string;
    fecha_creacion: Date;
    total: number;
    usuario_id: string;
}