import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [ButtonModule, MenuModule],
    template: `<div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notifications</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <span class="block text-muted-color font-medium mb-4">¡Alerta!</span>
<ul class="p-0 mx-0 mt-0 mb-6 list-none">
    <li class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
            <i class="pi pi-arrow-up text-xl! text-green-500"></i>
        </div>
        <span class="text-surface-900 dark:text-surface-0 leading-normal"
            >Richard
            <span class="text-surface-700 dark:text-surface-100">La reserva del hotel en Roma vence mañana. <span class="text-primary font-bold">Confirma el pago ahora.</span></span>
        </span>
    </li>
    <li class="flex items-center py-2">
        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
            <i class="pi pi-arrow-up text-xl! text-green-500"></i>
        </div>
        <span class="text-surface-700 dark:text-surface-100 leading-normal">Tu vuelo a París <span class="text-primary font-bold">sale en 3 horas.</span> ¡Dirígete al aeropuerto!</span>
    </li>
</ul>

<span class="block text-muted-color font-medium mb-4">Recordatorio de Empaque</span>
<ul class="p-0 m-0 list-none mb-6">
    <li class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
            <i class="pi pi-arrow-up text-xl! text-green-500"></i>
        </div>
        <span class="text-surface-900 dark:text-surface-0 leading-normal"
            >Importante!
            <span class="text-surface-700 dark:text-surface-100">Faltan 2 días para tu viaje a la playa. ¿Ya revisaste la lista de Equipaje? <span class="text-primary font-bold">Recordatorio Diario</span></span>
        </span>
    </li>
    <li class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
            <i class="pi pi-arrow-up text-xl! text-green-500"></i>
        </div>
        <span class="text-surface-900 dark:text-surface-0 leading-normal"
            >Documento Requerido
            <span class="text-surface-700 dark:text-surface-100">¡Atención! Necesitas subir una copia digital de tu Visa para el destino.</span>
        </span>
    </li>
</ul>

<span class="block text-muted-color font-medium mb-4">¡Consejo!</span>
<ul class="p-0 m-0 list-none">
    <li class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
            <i class="pi pi-arrow-up text-xl! text-green-500"></i>
        </div>
        <span class="text-surface-900 dark:text-surface-0 leading-normal">El clima en tu destino será soleado. Empaca protector solar. <span class="text-primary font-bold">¡Consejo!</span></span>
    </li>
    <li class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-full mr-4 shrink-0">
            <i class="pi pi-arrow-up text-xl! text-green-500"></i>
        </div>
        <span class="text-surface-900 dark:text-surface-0 leading-normal"><span class="text-primary font-bold">Hito Alcanzado</span> Viaje Completado! Todas las tareas de preparación están terminadas.¡Disfruta!</span>
    </li>
</ul>
    </div>`
})
export class NotificationsWidget {
    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];
}
