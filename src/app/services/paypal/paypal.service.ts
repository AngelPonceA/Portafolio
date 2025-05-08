import { Injectable } from '@angular/core';

declare const paypal: any; 

@Injectable({
  providedIn: 'root',
})
export class PaypalService {
  constructor() {}

  /**

   * @param amount 
   * @param onApproveCallback 
   * @param onErrorCallback 
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
                value: amount.toFixed(2), 
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
          onApproveCallback(details); 
        });
      },
      onError: (err: any) => {
        console.error('Error en PayPal:', err);
        if (onErrorCallback) {
          onErrorCallback(err); 
        }
      },
    }).render('#paypal-button-container'); 
  }
}

