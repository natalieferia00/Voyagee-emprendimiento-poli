import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notifications</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <div *ngIf="notificacionesNuevas.length > 0">
            <span class="block text-muted-color font-medium mb-4">Recientes</span>
            <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                <li *ngFor="let noti of notificacionesNuevas" class="flex items-center py-2 border-b border-surface">
                    <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
                        <i class="pi pi-bell text-xl! text-green-500"></i>
                    </div>
                    <span class="text-surface-900 dark:text-surface-0 leading-normal">
                        <span class="text-primary font-bold mr-2">{{ noti.hora }}</span>
                        <span class="text-surface-700 dark:text-surface-100">{{ noti.descripcion }}</span>
                    </span>
                </li>
            </ul>
        </div>

      

        <span class="block text-muted-color font-medium mb-4">Crea y revisa tus Recordatorios/notificaciones</span>
        </div>`
})
export class NotificationsWidget implements OnInit, OnDestroy {
    notificacionesNuevas: any[] = [];
    private readonly LS_KEY = 'app_notificaciones_v1';

    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];

    ngOnInit() {
        this.cargarDatos();
        window.addEventListener('storage', () => this.cargarDatos());
    }

    cargarDatos() {
        const data = localStorage.getItem(this.LS_KEY);
        this.notificacionesNuevas = data ? JSON.parse(data) : [];
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.cargarDatos());
    }
}