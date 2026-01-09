import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
/* PrimeNG */
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

interface Gasto {
    id: number;
    categoria: string;
    descripcion: string;
    monto: number;
}

interface Destino {
    id: number;
    nombre: string;
    presupuestoAsignado: number; // Mantenemos compatibilidad con tu estructura
    gastos: Gasto[];
}

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget', 
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, CurrencyPipe], 
    template: `
        <div class="card mb-0">
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-xl">Resumen de Destinos</div>
                <p-button icon="pi pi-refresh" [rounded]="true" [text]="true" (onClick)="loadFromStorage()"></p-button>
            </div>
            
            <p-table [value]="destinations" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th style="width: 4rem">Info</th> 
                        <th pSortableColumn="nombre">Destino <p-sortIcon field="nombre"></p-sortIcon></th>
                        <th>Estado</th>
                        <th pSortableColumn="montoTotal" class="text-right">Total Gastado <p-sortIcon field="montoTotal"></p-sortIcon></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-destination>
                    <tr>
                        <td>
                            <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-full" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-map text-blue-500"></i>
                            </div>
                        </td>
                        <td style="width: 40%;">
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ destination.nombre }}</span>
                        </td> 
                        <td style="width: 30%;">
                            <span [class]="getBadgeClass(destination)">
                                {{ getStatus(destination) }}
                            </span>
                        </td>
                        <td style="width: 30%;" class="text-right font-bold">
                            {{ calculateTotal(destination) | currency: 'USD' }}
                        </td> 
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="4" class="text-center p-8 text-muted-color">
                            No hay destinos registrados.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>`,
})
export class RecentSalesWidget implements OnInit, OnDestroy { 
    destinations: Destino[] = []; 
    // Usamos la llave actualizada de la calculadora maestra
    private readonly LS_KEY = 'mis_destinos_data_v2';

    ngOnInit() {
        this.loadFromStorage();
        // Escucha automática de cambios
        window.addEventListener('storage', () => this.loadFromStorage());
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.loadFromStorage());
    }

    loadFromStorage() {
        const data = localStorage.getItem(this.LS_KEY) ?? '[]';
        this.destinations = JSON.parse(data);
    }

    calculateTotal(destino: Destino): number {
        return (destino.gastos || []).reduce((acc, g) => acc + (g.monto || 0), 0);
    }

    getStatus(destino: Destino): string {
        const total = this.calculateTotal(destino);
        if (total === 0) return 'PENDIENTE';
        // En esta vista, comparamos contra el presupuesto asignado al destino específico
        return total > (destino.presupuestoAsignado || 0) && destino.presupuestoAsignado > 0 ? 'EXCEDIDO' : 'DENTRO';
    }

    getBadgeClass(destino: Destino): string {
        const total = this.calculateTotal(destino);
        const base = 'px-2 py-1 rounded-sm text-xs font-bold ';
        
        if (total === 0) return base + 'bg-surface-100 text-surface-600 dark:bg-surface-800';
        
        return total > (destino.presupuestoAsignado || 0) && destino.presupuestoAsignado > 0
            ? base + 'bg-red-100 text-red-600 dark:bg-red-400/10' 
            : base + 'bg-green-100 text-green-600 dark:bg-green-400/10';
    }
}