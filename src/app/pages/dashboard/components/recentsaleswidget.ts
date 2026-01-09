import { Component, OnInit, OnDestroy } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule, CurrencyPipe } from '@angular/common';

// Mantenemos la estructura de datos compatible con tu calculadora
interface Gasto {
    id: number;
    categoria: string;
    descripcion: string;
    monto: number;
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
            <div class="flex justify-content-between align-items-center mb-4">
                <div class="font-semibold text-xl">Resumen de Destinos</div>
                <p-button icon="pi pi-refresh" styleClass="p-button-text p-button-sm" (onClick)="loadFromStorage()"></p-button>
            </div>
            
            <p-table [value]="destinations" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <th style="width: 4rem">Info</th> 
                        <th pSortableColumn="nombre">Destino <p-sortIcon field="nombre"></p-sortIcon></th>
                        <th pSortableColumn="presupuestoAsignado">Presupuesto <p-sortIcon field="presupuestoAsignado"></p-sortIcon></th>
                        <th pSortableColumn="totalGastado">Gastado <p-sortIcon field="totalGastado"></p-sortIcon></th>
                        <th>Estado</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-destination>
                    <tr>
                        <td>
                            <i class="pi pi-eye text-2xl text-blue-500"></i> 
                        </td>
                        <td style="width: 35%; min-width: 7rem;">
                            <span class="font-medium">{{ destination.nombre }}</span>
                        </td> 
                        <td style="width: 25%;">
                            {{ destination.presupuestoAsignado | currency: 'USD' }}
                        </td>
                        <td style="width: 25%;" class="font-bold">
                            {{ calculateTotal(destination) | currency: 'USD' }}
                        </td> 
                        <td style="width: 15%;">
                            <span [class]="getBadgeClass(destination)">
                                {{ getStatus(destination) }}
                            </span>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5" class="text-center p-4 text-500">
                            No hay destinos registrados en la calculadora.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>`,
})
export class RecentSalesWidget implements OnInit, OnDestroy { 
    destinations: Destino[] = []; 
    // Usamos la misma clave que definimos en la calculadora corregida anteriormente
    private LS_KEY = 'viajes_v10_final';

    ngOnInit() {
        this.loadFromStorage();
        // Escuchar cambios en localStorage desde otras partes de la app
        window.addEventListener('storage', () => this.loadFromStorage());
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.loadFromStorage());
    }

    loadFromStorage() {
        const data = localStorage.getItem(this.LS_KEY);
        if (data) {
            this.destinations = JSON.parse(data);
        } else {
            this.destinations = [];
        }
    }

    calculateTotal(destino: Destino): number {
        return (destino.gastos || []).reduce((acc, g) => acc + g.monto, 0);
    }

    getStatus(destino: Destino): string {
        const total = this.calculateTotal(destino);
        if (total === 0) return 'Sin Gastos';
        return total > destino.presupuestoAsignado ? 'Excedido' : 'Ok';
    }

    getBadgeClass(destino: Destino): string {
        const total = this.calculateTotal(destino);
        const base = 'border-round p-1 text-xs font-bold ';
        if (total === 0) return base + 'bg-gray-100 text-gray-600';
        return total > destino.presupuestoAsignado 
            ? base + 'bg-red-100 text-red-600' 
            : base + 'bg-green-100 text-green-600';
    }
}