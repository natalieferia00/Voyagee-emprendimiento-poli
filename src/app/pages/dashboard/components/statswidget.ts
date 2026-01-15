import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    providers: [CurrencyPipe],
    template: `
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Destinos Registrados</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.totalDestinos }}</div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-map-marker text-blue-500 text-2xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ stats.totalDestinos }} lugares </span>
            <span class="text-muted-color">en itinerario</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Presupuesto General</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.presupuestoTotal | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
                <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-wallet text-orange-500 text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">Límite establecido </span>
            <span class="text-muted-color">global</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Gasto Acumulado</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.gastoTotal | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
                <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-shopping-cart text-cyan-500 text-xl"></i>
                </div>
            </div>
            <span [class]="stats.gastoTotal > stats.presupuestoTotal ? 'text-red-500 font-medium' : 'text-primary font-medium'">
                {{ stats.totalGastosCount }} registros 
            </span>
            <span class="text-muted-color">de gastos</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Balance Restante</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl" 
                         [ngClass]="{'text-red-500': stats.balance < 0}">
                        {{ stats.balance | currency:'USD':'symbol':'1.0-0' }}
                    </div>
                </div>
                <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-chart-line text-purple-500 text-xl"></i>
                </div>
            </div>
            <span class="font-medium" [ngClass]="stats.porcentajeConsumido > 100 ? 'text-red-500' : 'text-primary'">
                {{ stats.porcentajeConsumido | number:'1.0-0' }}% 
            </span>
            <span class="text-muted-color">del total</span>
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

    // Llaves actualizadas para coincidir con la Calculadora Maestra
    private readonly LS_KEY_DATA = 'mis_destinos_data_v2';
    private readonly LS_KEY_GLOBAL = 'mi_presupuesto_global';

    ngOnInit() {
        this.updateStats();
        // Escucha cambios locales y de otras pestañas
        window.addEventListener('storage', () => this.updateStats());
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.updateStats());
    }

    updateStats() {
        const dataStr = localStorage.getItem(this.LS_KEY_DATA) ?? '[]';
        const globalStr = localStorage.getItem(this.LS_KEY_GLOBAL) ?? '0';

        const destinos: any[] = JSON.parse(dataStr);
        const presupuestoGlobal = JSON.parse(globalStr);

        let totalGasto = 0;
        let totalRegistros = 0;

        destinos.forEach(d => {
            const gastosArr = d.gastos || [];
            totalRegistros += gastosArr.length;
            totalGasto += gastosArr.reduce((acc: number, g: any) => acc + (g.monto || 0), 0);
        });

        this.stats = {
            totalDestinos: destinos.length,
            presupuestoTotal: presupuestoGlobal,
            gastoTotal: totalGasto,
            balance: presupuestoGlobal - totalGasto,
            totalGastosCount: totalRegistros,
            porcentajeConsumido: presupuestoGlobal > 0 ? (totalGasto / presupuestoGlobal) * 100 : 0
        };
    }
}