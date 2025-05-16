export interface solicitudSoporte {
    titulo: string;
    descripcion: string;
    motivo: 'tecnico' | 'envio' | 'sugerencia' | 'usuario' | 'otro';
    estado: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
    fechaCreacion: Date;
    usuarioId: string;
    imagenes?: string[];
}
