import { Component, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, CurrencyPipe],
    template: `
    <div class="card shadow-sm border-round p-4 bg-white h-full">
        <div class="flex justify-between items-center mb-6">
            <div>
                <div class="font-bold text-xl text-slate-800">Distribución de Gastos</div>
                <p class="text-xs text-slate-500 font-medium">vs Meta Recomendada</p>
            </div>
            <div class="p-3 bg-indigo-50 rounded-xl">
                <i class="pi pi-chart-bar text-indigo-500 text-xl"></i>
            </div>
        </div>
        
        <ul class="list-none p-0 m-0" *ngIf="categoriasData.length > 0; else emptyState">
            <li *ngFor="let cat of categoriasData" class="flex flex-col mb-6">
                <div class="flex justify-between mb-2">
                    <span class="text-slate-700 font-semibold text-sm">{{ cat.nombre }}</span>
                    <span [class]="'font-black text-sm ' + (cat.porcentaje > 100 ? 'text-red-500' : 'text-indigo-600')">
                        {{ cat.porcentaje }}%
                    </span>
                </div>
                
                <div class="bg-slate-100 rounded-full overflow-hidden w-full" style="height: 10px">
                    <div [class]="'h-full transition-all duration-1000 ease-out ' + (cat.porcentaje > 100 ? 'bg-red-500' : cat.color)" 
                         [style.width.%]="cat.porcentaje > 100 ? 100 : cat.porcentaje"></div>
                </div>
                
                <div class="flex justify-between mt-2 text-[10px] uppercase tracking-wider font-bold">
                    <span class="text-slate-400">Uso: {{ cat.gastado | currency:'USD':'symbol':'1.0-0' }}</span>
                    <span class="text-slate-500">Meta: {{ cat.limite | currency:'USD':'symbol':'1.0-0' }}</span>
                </div>
            </li>
        </ul>

        <ng-template #emptyState>
            <div class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-2xl min-h-[200px]">
                <i class="pi pi-exclamation-circle text-4xl text-slate-200 mb-3"></i>
                <p class="text-slate-400 text-center text-sm font-medium">
                    Define un presupuesto general para ver el análisis.
                </p>
            </div>
        </ng-template>
    </div>`
})
export class BestSellingWidget implements OnInit, OnDestroy {
    categoriasData: any[] = [];
    private cdr = inject(ChangeDetectorRef);
    private refreshInterval: any;
    
    private readonly LS_DESTINOS = 'mis_destinos_data_v2';
    private readonly LS_BUDGET = 'backup_budget';

    ngOnInit() {
        this.recalcularTodo();
        
        // Escucha cambios de otras pestañas o componentes
        window.addEventListener('storage', () => this.recalcularTodo());
        
        // Intervalo de seguridad para cambios en la misma pestaña
        this.refreshInterval = setInterval(() => this.recalcularTodo(), 1500);
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.recalcularTodo());
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }

    recalcularTodo() {
        const destinos = JSON.parse(localStorage.getItem(this.LS_DESTINOS) || '[]');
        const presupuestoTotal = Number(localStorage.getItem(this.LS_BUDGET)) || 0;

        if (presupuestoTotal <= 0) {
            if (this.categoriasData.length !== 0) {
                this.categoriasData = [];
                this.cdr.detectChanges();
            }
            return;
        }

        const metas = [
            { id: 'Vuelos', nombre: 'Tiquetes', pct: 0.40, color: 'bg-orange-500' },
            { id: 'Hospedaje', nombre: 'Hospedaje', pct: 0.30, color: 'bg-purple-500' },
            { id: 'Comida', nombre: 'Alimentación', pct: 0.15, color: 'bg-emerald-500' },
            { id: 'Transporte', nombre: 'Transporte', pct: 0.10, color: 'bg-blue-500' },
            { id: 'Otros', nombre: 'Otros', pct: 0.05, color: 'bg-slate-400' }
        ];

        const nuevasCategorias = metas.map(meta => {
            const gastado = destinos.reduce((acc: number, d: any) => {
                const sumaCat = (d.gastos || [])
                    .filter((g: any) => g.categoria === meta.id)
                    .reduce((s: number, g: any) => s + (Number(g.monto) || 0), 0);
                return acc + sumaCat;
            }, 0);

            const limite = presupuestoTotal * meta.pct;
            const porcentaje = limite > 0 ? Math.round((gastado / limite) * 100) : 0;

            return { nombre: meta.nombre, gastado, limite, porcentaje, color: meta.color };
        });

        if (JSON.stringify(this.categoriasData) !== JSON.stringify(nuevasCategorias)) {
            this.categoriasData = nuevasCategorias;
            this.cdr.detectChanges();
        }
    }
}