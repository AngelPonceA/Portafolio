export interface Usuario {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    telefono: string;
    membresia: boolean;
    miembroHasta: any;
    recomendacion: any[];
    estaBloqueado?: boolean;
}