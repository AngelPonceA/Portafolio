import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebpayService {

  private apiUrl = 'http://localhost:3000/api/webpay'; 

  constructor(private http: HttpClient) {}

  crearTransaccion(data: { amount: number, session_id: string, buy_order: string }) {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  confirmarTransaccion(token: string) {
    return this.http.put(`${this.apiUrl}/commit/${token}`, {});
  }
}
