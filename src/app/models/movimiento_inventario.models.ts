export interface MovimientoInventario {
    id: string;
    cantidad: number;
    fecha_creacion: Date;
    motivo: string;
    producto_id: string;
    referencia: string;
    tipo: string;
    usuario_id: string;
    variante_id: string;
}