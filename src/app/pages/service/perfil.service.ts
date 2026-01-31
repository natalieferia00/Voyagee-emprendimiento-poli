import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private url = 'http://localhost:5000/api/user'; // Ruta correcta según tu index.js

  obtenerPerfil(): Observable<any> {
    const headers = new HttpHeaders().set('x-auth-token', localStorage.getItem('token') || '');
    return this.http.get(`${this.url}/profile`, { headers });
  }

  actualizarPerfil(datos: any): Observable<any> {
    const headers = new HttpHeaders().set('x-auth-token', localStorage.getItem('token') || '');
    return this.http.put(`${this.url}/profile`, datos, { headers }).pipe(
      tap(res => this.sincronizarPresupuesto(res))
    );
  }

  // MÉTODO CLAVE PARA LOS WIDGETS
  private sincronizarPresupuesto(data: any) {
    if (data.presupuestoTotal !== undefined) {
      // Actualizamos el valor que escuchan los widgets
      localStorage.setItem('backup_budget', data.presupuestoTotal.toString());
      // Notificamos a toda la app del cambio
      window.dispatchEvent(new Event('storage'));
    }
  }
}