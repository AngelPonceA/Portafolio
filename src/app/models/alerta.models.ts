export interface Alerta {
    id: string;
    usuario_id: string;
    titulo: string;
    descripcion: string;
    fec_creacion: Date;
    leido: boolean;
}