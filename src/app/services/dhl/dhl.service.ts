import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DhlService {
  getShippingRates(origen: string, destino: string, peso: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.dhlApiUrl; 
  private apiKey = environment.dhlApiKey;

  constructor(private http: HttpClient) {}
  //construccion de token de la api
  getAuthToken(): Observable<any> {
    const apiUrl = `${this.apiUrl}/auth/token`;
    const headers = new HttpHeaders({'Content-Type': 'application/json' });

    const body = {
      "grant_type": "client_credentials",
      "client_id": this.apiKey,
      "client_secret": 'pnnEQv09UfxvIRR0'
    };
    return this.http.post(apiUrl, body, { headers });
  }
}
