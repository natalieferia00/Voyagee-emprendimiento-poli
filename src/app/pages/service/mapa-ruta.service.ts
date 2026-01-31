import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MapaRutaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/maparuta'; // Ruta que crearemos en el backend

  getDestinos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  saveDestino(destino: any): Observable<any> {
    return this.http.post(this.apiUrl, destino);
  }

  deleteDestino(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}