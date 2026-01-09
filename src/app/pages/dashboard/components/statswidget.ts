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
                    <i class="pi pi-send text-blue-500 text-2xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ stats.totalDestinos }} lugares </span>
            <span class="text-muted-color">en total</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Presupuesto Total</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.presupuestoTotal | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
                <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-wallet text-orange-500 text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">Asignado </span>
            <span class="text-muted-color">para viajes</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Gasto Realizado</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.gastoTotal | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
                <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-globe text-cyan-500 text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ stats.totalGastosCount }} tickets </span>
            <span class="text-muted-color">registrados</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Balance Disponible</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ stats.balance | currency:'USD':'symbol':'1.0-0' }}</div>
                </div>
                <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-question-circle text-purple-500 text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">{{ stats.porcentajeConsumido | number:'1.0-0' }}% </span>
            <span class="text-muted-color">utilizado</span>
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

    private LS_KEY = 'viajes_v10_final';

    ngOnInit() {
        this.updateStats();
        window.addEventListener('storage', () => this.updateStats());
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.updateStats());
    }

    updateStats() {
        const data = localStorage.getItem(this.LS_KEY);
        const destinos: any[] = data ? JSON.parse(data) : [];

        let presupuesto = 0;
        let gasto = 0;
        let count = 0;

        destinos.forEach(d => {
            presupuesto += (d.presupuestoAsignado || 0);
            const gastosArr = d.gastos || [];
            count += gastosArr.length;
            gasto += gastosArr.reduce((acc: number, g: any) => acc + (g.monto || 0), 0);
        });

        this.stats = {
            totalDestinos: destinos.length,
            presupuestoTotal: presupuesto,
            gastoTotal: gasto,
            balance: presupuesto - gasto,
            totalGastosCount: count,
            porcentajeConsumido: presupuesto > 0 ? (gasto / presupuesto) * 100 : 0
        };
    }
}