import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
// Ajusta la cantidad de ../ según tu estructura de carpetas real
import { NotificationService, Notification } from '../../service/notification.service';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notificaciones</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" (click)="menu.toggle($event)" class="p-button-rounded p-button-text p-button-plain"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <ul class="p-0 m-0 list-none">
            <li *ngFor="let noti of notificaciones" class="flex items-center py-2 border-b border-surface">
                <div class="w-10 h-10 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-3 shrink-0">
                    <i class="pi pi-bell text-orange-500"></i>
                </div>
                <div class="flex-1">
                    <div class="font-medium text-surface-900 dark:text-surface-0">{{ noti.descripcion }}</div>
                    <div class="text-sm text-muted-color">{{ noti.fecha | date:'HH:mm' }}</div>
                </div>
            </li>
            <li *ngIf="notificaciones.length === 0" class="py-4 text-center text-muted-color">
                No hay notificaciones recientes
            </li>
        </ul>
    </div>`
})
export class NotificationsWidget implements OnInit, OnDestroy {
    notificaciones: Notification[] = [];
    items: MenuItem[] = [
        { label: 'Actualizar', icon: 'pi pi-refresh', command: () => this.notiService.refresh() }
    ];
    private sub?: Subscription;

    constructor(private notiService: NotificationService) {}

    ngOnInit() {
        // Escucha cambios del servicio para sincronización en tiempo real
        this.sub = this.notiService.notifications$.subscribe(data => {
            this.notificaciones = data.slice(0, 5);
        });
    }

    ngOnDestroy() {
        if (this.sub) this.sub.unsubscribe();
    }
}