import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ListaViajeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/listaviaje';

  getItems(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  saveItem(item: any): Observable<any> {
    return this.http.post(this.apiUrl, item);
  }

  updateItem(id: string, item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, item);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}