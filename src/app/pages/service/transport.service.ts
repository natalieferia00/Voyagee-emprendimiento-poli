import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransportService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:5000/api/transports';

    getTransports(): Observable<any[]> { return this.http.get<any[]>(this.API_URL); }
    saveTransport(data: any): Observable<any> { return this.http.post<any>(this.API_URL, data); }
    deleteTransport(id: string): Observable<any> { return this.http.delete<any>(`${this.API_URL}/${id}`); }
}