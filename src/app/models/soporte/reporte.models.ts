export interface reporte {
    titulo: string;
    descripcion: string;
    motivo: 'acoso' | 'contenido inapropiado' | 'spam' | 'otro';
    fechaCreacion: Date;
    usuarioId: string;
    imagenes?: string[];
    estado: 'pendiente' | 'resuelto' | 'cerrado';
    usuarioReportado: string;
    respuestaAdmin?: string;
    fechaRespuesta?: Date;
    prioridad?: 'baja' | 'media' | 'alta';
}
