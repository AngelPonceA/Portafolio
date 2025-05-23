export interface solicitudSoporte {
    id?: string;
    titulo: string;
    descripcion: string;
    motivo: 'tecnico' | 'envio' | 'sugerencia' | 'usuario' | 'otro';
    estado: 'pendiente' | 'resuelto' | 'rechazado';
    fechaCreacion: Date;
    usuarioId: string;
    imagenes?: string[];
    justificacion?: string;
}
