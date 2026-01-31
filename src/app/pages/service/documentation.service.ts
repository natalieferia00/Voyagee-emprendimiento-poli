import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/documents';

  getDocs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  saveDoc(doc: any): Observable<any> {
    if (doc._id) {
      return this.http.put(`${this.apiUrl}/${doc._id}`, doc);
    }
    return this.http.post(this.apiUrl, doc);
  }

  deleteDoc(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}