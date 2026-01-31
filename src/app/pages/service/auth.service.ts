import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = 'http://localhost:5000/api/auth';

  register(user: any): Observable<any> {
    return this.http.post(`${this.url}/register`, user);
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.url}/login`, user);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }
}