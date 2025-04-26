export interface Direccion {
    id: string;
    usuario_id: string;
    region: string;
    comuna: string;
    calle_numero: string;
    nombre_apellido: string;
    telefono: string;
    departamento?: string;
    descripcion: string;
}