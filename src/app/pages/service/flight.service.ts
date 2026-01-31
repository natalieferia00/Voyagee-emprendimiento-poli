import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private http = inject(HttpClient);
  private url = 'http://localhost:5000/api/flights';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('x-auth-token', token || '');
  }

  getFlights(): Observable<any[]> {
    return this.http.get<any[]>(this.url, { headers: this.getHeaders() });
  }

  saveFlight(flight: any): Observable<any> {
    return this.http.post<any>(this.url, flight, { headers: this.getHeaders() });
  }

  deleteFlight(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }
}