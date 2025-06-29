export interface reporte {
    id?: string;
    titulo: string;
    descripcion: string;
    motivo: 'acoso' | 'contenido inapropiado' | 'spam' | 'otro';
    fechaCreacion: Date;
    usuarioId: string;
    imagenes?: string[];
    estado: 'pendiente' | 'resuelto' | 'rechazado';
    usuarioReportado: string;
    justificacion?: string;
}