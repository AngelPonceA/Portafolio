export interface Direccion {
    id: string;
    usuario_id?: string;
    producto_id?: string
    region: string;
    comuna: string;
    calle: string;
    numero: number;
    nombres?: string;
    apellidos?: string;
    telefono?: string;
    departamento?: string;
    descripcion?: string;
}

