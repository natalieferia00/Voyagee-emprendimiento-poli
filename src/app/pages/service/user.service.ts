import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/user'; 

  // Genera los headers con el token para que el middleware no de 404/401
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('x-auth-token', token || '');
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getAuthHeaders() });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, { headers: this.getAuthHeaders() });
  }

  changePassword(passwords: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwords, { headers: this.getAuthHeaders() });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/account`, { headers: this.getAuthHeaders() });
  }
}