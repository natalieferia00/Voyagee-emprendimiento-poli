import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FoodService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:5000/api/foods';

    getFoods(): Observable<any[]> { return this.http.get<any[]>(this.API_URL); }
    saveFood(data: any): Observable<any> { return this.http.post<any>(this.API_URL, data); }
    deleteFood(id: string): Observable<any> { return this.http.delete<any>(`${this.API_URL}/${id}`); }
}