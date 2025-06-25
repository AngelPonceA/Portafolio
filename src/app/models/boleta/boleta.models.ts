import { Direccion } from "../direccion.models";
import { ProductoBoleta } from "./producto_boleta.models";

export interface Boleta {
    usuario_id: string;
    fecha_creacion: Date; 
    ordenCompra: string;
    montoPagado: number;
    productos: ProductoBoleta[];
    direccion_envio: Direccion;
    estado: 'pagada'
    cod_autorizacion: string;
    metodoDePago: 'webpay'
}