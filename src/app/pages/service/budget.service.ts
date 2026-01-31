import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/budget';

  // Coincide con tu router.get('/data')
  getData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/data`).pipe(
      catchError(() => {
        const local = localStorage.getItem('mis_destinos_data_v2');
        return of({ destinos: local ? JSON.parse(local) : [], globalBudget: 0 });
      })
    );
  }

  // Coincide con tu router.post('/global')
  saveGlobalBudget(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/global`, { amount });
  }

  // Coincide con tu router.post('/destino')
  saveDestino(destino: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/destino`, destino);
  }

  // Coincide con tu router.delete('/destino/:id')
  deleteDestino(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/destino/${id}`);
  }
}