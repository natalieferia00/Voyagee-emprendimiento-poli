import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

interface PresupuestoCategoria {
    nombre: string;
    subtitulo: string;
    color: string;
    gastado: number;
    total: number;
}

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Avance del viaje</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>
        
        <ul class="list-none p-0 m-0">
            <li *ngFor="let cat of categorias" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ cat.nombre }}</span>
                    <div class="mt-1 text-muted-color">{{ cat.subtitulo }}</div>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                        <div [class]="'h-full ' + cat.color" [style.width]="getPorcentaje(cat) + '%'"></div>
                    </div>
                    <span [class]="'ml-4 font-medium ' + getTextColor(cat.color)">
                        %{{ getPorcentaje(cat) }}
                    </span>
                </div>
            </li>
        </ul>
    </div>`
})
export class BestSellingWidget implements OnInit, OnDestroy {
    private readonly LS_KEY_PRESUPUESTO = 'app_presupuesto_viaje';
    categorias: PresupuestoCategoria[] = [];

    items = [
        { label: 'Actualizar', icon: 'pi pi-fw pi-refresh', command: () => this.cargarPresupuestos() }
    ];

    ngOnInit() {
        this.cargarPresupuestos();
        // Escucha cambios desde la calculadora
        window.addEventListener('storage', this.onStorageChange.bind(this));
    }

    private onStorageChange() {
        this.cargarPresupuestos();
    }

    cargarPresupuestos() {
        const data = localStorage.getItem(this.LS_KEY_PRESUPUESTO);
        if (data) {
            this.categorias = JSON.parse(data);
        } else {
            // Datos iniciales por defecto
            this.categorias = [
                { nombre: 'Tiquetes', subtitulo: 'tiquetes de viaje', color: 'bg-orange-500', gastado: 0, total: 100 },
                { nombre: 'Alimentacion', subtitulo: 'plan de comidas', color: 'bg-cyan-500', gastado: 0, total: 100 },
                { nombre: 'Hospedaje', subtitulo: 'Hoteles, hostales, etc', color: 'bg-pink-500', gastado: 0, total: 100 },
                { nombre: 'Seguros', subtitulo: 'seguros de viaje', color: 'bg-green-500', gastado: 0, total: 100 },
                { nombre: 'Equipaje', subtitulo: 'checklist equipaje', color: 'bg-purple-500', gastado: 0, total: 100 }
            ];
        }
    }

    getPorcentaje(cat: PresupuestoCategoria): number {
        if (!cat.total || cat.total === 0) return 0;
        const porc = Math.round((cat.gastado / cat.total) * 100);
        return porc > 100 ? 100 : porc;
    }

    getTextColor(bgColor: string): string {
        return bgColor.replace('bg-', 'text-');
    }

    ngOnDestroy() {
        window.removeEventListener('storage', this.onStorageChange.bind(this));
    }
}