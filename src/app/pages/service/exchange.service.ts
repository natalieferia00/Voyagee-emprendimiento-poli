import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  // Reemplaza con tu propia API KEY si tienes una
  private url = 'https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/COP';

  constructor(private http: HttpClient) {}

  obtenerTasas(): Observable<any> {
    return this.http.get(this.url).pipe(
      map((res: any) => res.conversion_rates)
    );
  }
}