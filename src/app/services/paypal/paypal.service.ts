import { Injectable } from '@angular/core';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {

  private environment: paypal.core.SandboxEnvironment;
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    // Se reemplaza por mis credenciales de paypal developer
    this.environment = new paypal.core.SandboxEnvironment('AWSo23DumdN9HGOcQAt10HrzQ8acey1LyUpHATJ5uO4ivs-lAMh-Tol2vipHGjgYV6LbxmP3LvgGFIez', 'EAZLFHQl-MSCsWZxqvJthr0T5Cn8FSyG4c9YqFYnMi7XaBlAtm9xH0TbIBWiPdnsAnnh6DNFdlBjvSvf');
    this.client = new paypal.core.PayPalHttpClient(this.environment);
  }

  async createOrder(): Promise<any> {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00' 
        }
      }]
    });

    try {
      const response = await this.client.execute(request);
      return response.result;
    } catch (error) {
      console.error('Error al crear la orden:', error);
      throw error;
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const response = await this.client.execute(request);
      return response.result;
    } catch (error) {
      console.error('Error al capturar la orden:', error);
      throw error;
    }
  }
}
