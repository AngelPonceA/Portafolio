export interface MensajeSoporte {
    id: string;
    usuario_id: string;
    agente_id: string;
    asunto: string;
    descripcion: string;
    estado: string;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
    prioridad: string;
}