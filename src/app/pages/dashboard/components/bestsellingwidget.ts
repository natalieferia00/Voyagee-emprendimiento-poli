import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule],
    template: `
    <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Estado de Presupuesto (distribución recomendada)</div>
            <i class="pi pi-chart-bar text-muted-color text-xl"></i>
        </div>
        
        <ul class="list-none p-0 m-0" *ngIf="categorias.length > 0">
            <li *ngFor="let cat of categorias" class="flex flex-col mb-6">
                <div class="flex justify-between mb-2">
                    <span class="text-surface-900 dark:text-surface-0 font-medium">{{ cat.nombre }}</span>
                    <span [class]="'font-bold ' + (esExceso(cat) ? 'text-red-500' : getTextColor(cat.color))">
                        {{ getPorcentaje(cat) }}%
                    </span>
                </div>
                
                <div class="bg-surface-300 dark:bg-surface-500 rounded-full overflow-hidden w-full" style="height: 10px">
                    <div [class]="'h-full transition-all duration-500 ' + (esExceso(cat) ? 'bg-red-500' : cat.color)" 
                         [style.width]="getPorcentaje(cat) + '%'"></div>
                </div>
                
                <div class="flex justify-between mt-1 text-xs text-muted-color">
                    <span>Gastado: {{ cat.gastado | currency:'USD' }}</span>
                    <span>Meta: {{ cat.total | currency:'USD' }}</span>
                </div>
            </li>
        </ul>

        <div *ngIf="categorias.length === 0" class="text-center p-8 border-2 border-dashed border-surface rounded-xl">
            <p class="text-muted-color">Define un presupuesto en la calculadora para ver el avance.</p>
        </div>
    </div>`
})
export class BestSellingWidget implements OnInit, OnDestroy {
    categorias: any[] = [];
    private readonly LS_KEY = 'app_presupuesto_sync';
    private cdr = inject(ChangeDetectorRef);

    // Definimos el listener como una propiedad para poder removerlo correctamente
    private storageListener = () => this.cargarDatos();

    ngOnInit() {
        this.cargarDatos();
        // Escucha cambios de otras pestañas
        window.addEventListener('storage', this.storageListener);
        // Escucha cambios de la misma pestaña (Evento personalizado)
        window.addEventListener('local-data-updated', this.storageListener);
    }

    cargarDatos() {
        const data = localStorage.getItem(this.LS_KEY);
        this.categorias = data ? JSON.parse(data) : [];
        this.cdr.detectChanges(); // Forzamos la detección de cambios
    }

    getPorcentaje(cat: any): number {
        if (!cat.total || cat.total === 0) return 0;
        const p = Math.round((cat.gastado / cat.total) * 100);
        return p > 100 ? 100 : p;
    }

    esExceso(cat: any): boolean {
        return cat.gastado > cat.total;
    }

    getTextColor(bg: string) { 
        return bg.replace('bg-', 'text-').replace('-500', '-600'); 
    }

    ngOnDestroy() {
        window.removeEventListener('storage', this.storageListener);
        window.removeEventListener('local-data-updated', this.storageListener);
    }
}