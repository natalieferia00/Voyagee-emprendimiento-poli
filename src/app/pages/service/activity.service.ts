import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/activities'; // Asegúrate que el puerto coincida

  getActivities(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  saveActivity(activity: any): Observable<any> {
    if (activity._id) {
      return this.http.put(`${this.apiUrl}/${activity._id}`, activity);
    }
    return this.http.post(this.apiUrl, activity);
  }

  deleteActivity(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}