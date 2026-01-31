import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Notification {
    id?: number;
    _id?: string;
    fecha: Date;
    hora: string;
    descripcion: string;
    estado?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private apiUrl = 'http://localhost:5000/api/notifications';
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.refresh();
    }

    refresh() {
        this.http.get<Notification[]>(this.apiUrl).subscribe({
            next: (data) => this.notificationsSubject.next(data),
            error: (err) => console.error('Error de sincronización:', err)
        });
    }

    add(noti: any): Observable<Notification> {
        return this.http.post<Notification>(this.apiUrl, noti).pipe(
            tap(() => this.refresh())
        );
    }

    update(id: string | number, noti: any): Observable<Notification> {
        return this.http.put<Notification>(`${this.apiUrl}/${id}`, noti).pipe(
            tap(() => this.refresh())
        );
    }

    delete(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`).pipe(
            tap(() => this.refresh())
        );
    }
}