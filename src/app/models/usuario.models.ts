export interface Usuario {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    telefono: string;
    recomendacion: any[];
    estaBloqueado?: boolean;
}