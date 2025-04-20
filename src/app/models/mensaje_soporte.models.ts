export interface MensajeSoporte {
    id: string;
    usuario_id: string;
    adjuntos: string[];
    contenido: string;
    fecha_creacion: Date;
    es_interno: boolean;
}