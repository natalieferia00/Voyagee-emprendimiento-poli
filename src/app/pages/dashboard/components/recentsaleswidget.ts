import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

interface Gasto {
    id: number;
    categoria: string;
    descripcion: string;
    monto: number;
    estado: string; // Importante para el filtro de la calculadora
}

interface Destino {
    id: number;
    nombre: string;
    presupuestoAsignado: number;
    gastos: Gasto[];
}

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget', 
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, CurrencyPipe], 
    template: `
        <div class="card mb-0">
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-xl text-slate-700">Resumen de Inversión por Destino</div>
                <p-button icon="pi pi-refresh" [rounded]="true" [text]="true" (onClick)="loadFromStorage()"></p-button>
            </div>
            
            <p-table [value]="destinations" [paginator]="true" [rows]="5" responsiveLayout="scroll" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                    <tr class="text-slate-400 text-xs uppercase">
                        <th style="width: 4rem">Icono</th> 
                        <th pSortableColumn="nombre">Destino <p-sortIcon field="nombre"></p-sortIcon></th>
                        <th>Estado Presupuesto</th>
                        <th pSortableColumn="montoTotal" class="text-right">Total Reservado <p-sortIcon field="montoTotal"></p-sortIcon></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-destination>
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td>
                            <div class="flex items-center justify-center bg-emerald-100 dark:bg-emerald-400/10 rounded-lg" style="width: 2.5rem; height: 2.5rem">
                                <i class="pi pi-map-marker text-emerald-600"></i>
                            </div>
                        </td>
                        <td style="width: 40%;">
                            <span class="font-bold text-slate-800">{{ destination.nombre }}</span>
                        </td> 
                        <td style="width: 30%;">
                            <span [class]="getBadgeClass(destination)">
                                {{ getStatus(destination) }}
                            </span>
                        </td>
                        <td style="width: 30%;" class="text-right font-black text-slate-900">
                            {{ calculateTotal(destination) | currency: 'USD' }}
                        </td> 
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="4" class="text-center p-8 text-slate-500 font-medium">
                            No hay destinos con reservas activas.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>`,
})
export class RecentSalesWidget implements OnInit, OnDestroy { 
    destinations: Destino[] = []; 
    private readonly LS_KEY = 'mis_destinos_data_v2';

    ngOnInit() {
        this.loadFromStorage();
        window.addEventListener('storage', () => this.loadFromStorage());
        // Escucha adicional para eventos personalizados de la app
        window.addEventListener('local-data-updated', () => this.loadFromStorage());
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.loadFromStorage());
        window.removeEventListener('local-data-updated', () => this.loadFromStorage());
    }

    loadFromStorage() {
        const data = localStorage.getItem(this.LS_KEY) ?? '[]';
        this.destinations = JSON.parse(data);
    }

    // LÓGICA VOYAGEE: Solo sumamos lo que está 'Reservado'
    calculateTotal(destino: Destino): number {
        return (destino.gastos || [])
            .filter(g => g.estado === 'Reservado')
            .reduce((acc, g) => acc + (g.monto || 0), 0);
    }

    getStatus(destino: Destino): string {
        const total = this.calculateTotal(destino);
        if (total === 0) return 'SIN RESERVAS';
      
        return total > (destino.presupuestoAsignado || 0) && destino.presupuestoAsignado > 0 
            ? 'EXCEDIDO' 
            : 'DENTRO DEL LÍMITE';
    }

    // MÉTODO QUE DABA EL ERROR: Ahora asegurado
    getBadgeClass(destino: Destino): string {
        const total = this.calculateTotal(destino);
        const base = 'px-3 py-1 rounded-full text-[10px] font-black uppercase ';
        
        if (total === 0) return base + 'bg-slate-100 text-slate-500';
        
        return total > (destino.presupuestoAsignado || 0) && destino.presupuestoAsignado > 0
            ? base + 'bg-red-100 text-red-600 dark:bg-red-400/10' 
            : base + 'bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10';
    }
}