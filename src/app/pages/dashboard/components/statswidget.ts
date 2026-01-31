import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    providers: [CurrencyPipe, DecimalPipe],
    template: `
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0 shadow-sm">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Destinos Registrados</span>
                    <div class="text-surface-900 dark:text-surface-0 font-bold text-xl">{{ stats.totalDestinos }}</div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 rounded-xl" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-map-marker text-blue-500 text-xl"></i>
                </div>
            </div>
            <span class="text-blue-500 font-bold">{{ stats.totalDestinos }} </span>
            <span class="text-muted-color text-sm">lugares en itinerario</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0 shadow-sm">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Presupuesto General</span>
                    <div class="text-surface-900 dark:text-surface-0 font-bold text-xl">{{ stats.presupuestoTotal | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
                <div class="flex items-center justify-center bg-orange-100 rounded-xl" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-wallet text-orange-500 text-xl"></i>
                </div>
            </div>
            <span class="text-orange-500 font-bold">Límite establecido</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0 shadow-sm">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Gasto Acumulado</span>
                    <div class="text-surface-900 dark:text-surface-0 font-bold text-xl">{{ stats.gastoTotal | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
                <div class="flex items-center justify-center bg-cyan-100 rounded-xl" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-shopping-cart text-cyan-500 text-xl"></i>
                </div>
            </div>
            <span [class]="stats.gastoTotal > stats.presupuestoTotal ? 'text-red-500 font-bold' : 'text-cyan-500 font-bold'">
                {{ stats.totalGastosCount }} registros 
            </span>
            <span class="text-muted-color text-sm"> de gastos</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0 shadow-sm">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Balance Restante</span>
                    <div [class]="'font-bold text-xl ' + (stats.balance < 0 ? 'text-red-500' : 'text-surface-900')">
                        {{ stats.balance | currency:'USD':'symbol':'1.0-0' }}
                    </div>
                </div>
                <div [class]="'flex items-center justify-center rounded-xl ' + (stats.balance < 0 ? 'bg-red-100' : 'bg-purple-100')" style="width: 2.5rem; height: 2.5rem">
                    <i [class]="'pi text-xl ' + (stats.balance < 0 ? 'pi-exclamation-triangle text-red-500' : 'pi-chart-line text-purple-500')"></i>
                </div>
            </div>
            <span [class]="'font-bold ' + (stats.porcentajeConsumido > 100 ? 'text-red-500' : 'text-purple-500')">
                {{ stats.porcentajeConsumido | number:'1.0-0' }}% 
            </span>
            <span class="text-muted-color text-sm"> del total</span>
        </div>
    </div>
    `
})
export class StatsWidget implements OnInit, OnDestroy {
    stats = {
        totalDestinos: 0,
        presupuestoTotal: 0,
        gastoTotal: 0,
        balance: 0,
        totalGastosCount: 0,
        porcentajeConsumido: 0
    };

    private cdr = inject(ChangeDetectorRef);
    
    // Llaves unificadas con la calculadora
    private readonly LS_KEY_DATA = 'mis_destinos_data_v2';
    private readonly LS_KEY_BUDGET = 'backup_budget';

    ngOnInit() {
        this.updateStats();
        // Escucha el evento storage para cambios entre componentes
        window.addEventListener('storage', () => this.updateStats());
        // Intervalo de seguridad para asegurar sincronía en la misma pestaña
        this.refreshInterval = setInterval(() => this.updateStats(), 1000);
    }

    private refreshInterval: any;

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.updateStats());
        if (this.refreshInterval) clearInterval(this.refreshInterval);
    }

    updateStats() {
        const dataStr = localStorage.getItem(this.LS_KEY_DATA) ?? '[]';
        const budgetStr = localStorage.getItem(this.LS_KEY_BUDGET) ?? '0';

        const destinos: any[] = JSON.parse(dataStr);
        const presupuestoGlobal = Number(budgetStr);

        let totalGasto = 0;
        let totalRegistros = 0;

        destinos.forEach(d => {
            const gastosArr = d.gastos || [];
            totalRegistros += gastosArr.length;
            totalGasto += gastosArr.reduce((acc: number, g: any) => acc + (Number(g.monto) || 0), 0);
        });

        // Evitar actualizaciones de UI si los datos no han cambiado
        const nuevasStats = {
            totalDestinos: destinos.length,
            presupuestoTotal: presupuestoGlobal,
            gastoTotal: totalGasto,
            balance: presupuestoGlobal - totalGasto,
            totalGastosCount: totalRegistros,
            porcentajeConsumido: presupuestoGlobal > 0 ? (totalGasto / presupuestoGlobal) * 100 : 0
        };

        if (JSON.stringify(this.stats) !== JSON.stringify(nuevasStats)) {
            this.stats = nuevasStats;
            this.cdr.detectChanges();
        }
    }
}