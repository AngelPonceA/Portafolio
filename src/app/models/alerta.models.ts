export interface Alerta {
    id: string;
    titulo: string;
    descripcion: string;
    entidad_id: string;
    entidad_tipo: string;
    fec_creacion: Date;
    leido: boolean;
    severidad: string;
    tipo: string;
}