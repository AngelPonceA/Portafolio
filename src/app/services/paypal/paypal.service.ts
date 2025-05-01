import { Injectable } from '@angular/core';

declare const paypal: any; // Uso del SDK global de PayPal cargado en index.html

@Injectable({
  providedIn: 'root',
})
export class PaypalService {
  constructor() {}

  /**
   * Inicializa el botón de PayPal
   * @param amount Monto total de la compra en USD
   * @param onApproveCallback Callback que se ejecuta al aprobar el pago
   * @param onErrorCallback Callback que se ejecuta si ocurre un error
   */
  initializePayPalButton(
    amount: number,
    onApproveCallback: (details: any) => void,
    onErrorCallback?: (error: any) => void
  ): void {
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        // Crear la orden en PayPal
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: amount.toFixed(2), // Convierte el monto a un formato válido para USD
                currency_code: 'USD',
              },
            },
          ],
        });
      },
      onApprove: (data: any, actions: any) => {
        // Capturar el pago cuando sea aprobado
        return actions.order.capture().then((details: any) => {
          console.log('Pago exitoso:', details);
          onApproveCallback(details); // Ejecutar la función de aprobación proporcionada
        });
      },
      onError: (err: any) => {
        console.error('Error en PayPal:', err);
        if (onErrorCallback) {
          onErrorCallback(err); // Ejecutar la función de manejo de error si se proporciona
        }
      },
    }).render('#paypal-button-container'); // Renderizar el botón en el contenedor especificado
  }
}

