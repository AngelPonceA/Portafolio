import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DhlService {
  private apiUrl = environment.dhlApiUrl;
  private apiKey = environment.dhlApiKey;
  private apiSecret = environment.dhlApiSecret;
  private authTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  // Metodo para token de autenticacion
  private fetchAuthToken(): Observable<string> {
    const url = `${this.apiUrl}/auth/token`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      grant_type: "client_credentials",
      client_id: this.apiKey,
      client_secret: this.apiSecret
    };

    return this.http.post(url, body, { headers }).pipe(
      switchMap((response: any) => {
        console.log('Respuesta de la API de autenticación:', response); 
        if (!response || !response.access_token) {
          console.error('Error: La respuesta no contiene access_token');
          return throwError(() => new Error('El token de autenticación no está disponible.'));
        }
        
        this.authTokenSubject.next(response.access_token);
        return new Observable<string>(observer => {
          observer.next(response.access_token);
          observer.complete();
        });
      }),
      catchError(error => {
        console.error('Error al obtener el token de autenticación:', error);
        return throwError(() => new Error('Falló la autenticación con DHL.'));
      })
    );
  }

  // Método para obtener token reactivo
  private getAuthToken(): Observable<string> {
    if (this.authTokenSubject.value) {
      return new Observable(observer => {
        if (this.authTokenSubject.value !== null) {
          observer.next(this.authTokenSubject.value);
        } else {
          observer.error(new Error('Auth token is null.'));
        }
        observer.complete();
      });
    } else {
      return this.fetchAuthToken();
    }
  }

  // Tarifas de envios
  getShippingRates(origen: string, destino: string, peso: number): Observable<any> {
    return this.getAuthToken().pipe(
      switchMap(token => {
        const url = `${this.apiUrl}/rates`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        const body = { origen, destino, peso };
        return this.http.post(url, body, { headers }).pipe(
          catchError(error => {
            console.error('Error al obtener tarifas de envío:', error);
            return throwError(() => new Error('No se pudieron obtener tarifas de envío.'));
          })
        );
      })
    );
  }

  // Creacion de envios
  createShipment(datosEnvio: any): Observable<any> {
    return this.getAuthToken().pipe(
      switchMap(token => {
        const url = `${this.apiUrl}/shipments`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.post(url, datosEnvio, { headers }).pipe(
          catchError(error => {
            console.error('Error al crear el envío:', error);
            return throwError(() => new Error('No se pudo crear el envío.'));
          })
        );
      })
    );
  }
}
