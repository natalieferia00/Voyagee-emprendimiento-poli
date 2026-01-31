import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private http = inject(HttpClient);
  private url = 'http://localhost:5000/api/auth'; // Tu ruta de backend

  // Función para enviar los datos de configuración al Backend
  actualizarPerfil(datos: any): Observable<any> {
    const token = localStorage.getItem('token');
    
    // Configuramos el Header con el Token para que el backend nos deje pasar
    const headers = new HttpHeaders().set('x-auth-token', token || '');

    return this.http.put(`${this.url}/update-profile`, datos, { headers });
  }

  // Función para obtener los datos guardados en la nube
  obtenerPerfil(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.get(`${this.url}/perfil`, { headers });
  }
}