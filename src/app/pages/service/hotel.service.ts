import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // Inyectamos HttpClient de forma moderna
  private http = inject(HttpClient);

  // URL de tu API en Node.js
  private readonly API_URL = 'http://localhost:5000/api/hotels';

  /**
   * Obtiene todos los hoteles del usuario autenticado
   */
  getHotels(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  /**
   * Guarda un hotel. 
   * Si el objeto tiene _id, el backend debería manejarlo como actualización.
   */
  saveHotel(hotel: any): Observable<any> {
    return this.http.post<any>(this.API_URL, hotel);
  }

  /**
   * Elimina un hotel por su ID de MongoDB
   */
  deleteHotel(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`);
  }
}