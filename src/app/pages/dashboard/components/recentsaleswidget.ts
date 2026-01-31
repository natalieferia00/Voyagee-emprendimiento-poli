import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget', 
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, CurrencyPipe, TooltipModule], 
    template: `
        <div class="card mb-0 shadow-sm border-round bg-white">
            <div class="flex justify-between items-center mb-4 p-2">
                <div>
                    <div class="font-bold text-xl text-slate-800">Gasto por Categoría</div>
                    <p class="text-sm text-slate-500">Inversión total acumulada en el viaje</p>
                </div>
                <p-button icon="pi pi-sync" [rounded]="true" [text]="true" (onClick)="loadFromStorage()" pTooltip="Actualizar"></p-button>
            </div>
            
            <p-table [value]="categorySummary" responsiveLayout="scroll" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                    <tr class="text-slate-400 text-xs uppercase">
                        <th style="width: 3rem"></th>
                        <th>Categoría</th>
                        <th class="text-center">Estado</th>
                        <th class="text-right">Total Gastado</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-cat>
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td>
                            <div [class]="'flex items-center justify-center rounded-lg w-9 h-9 ' + cat.bgColor + ' ' + cat.textColor">
                                <i [class]="cat.icon"></i>
                            </div>
                        </td>
                        <td>
                            <span class="font-bold text-slate-700">{{ cat.nombre }}</span>
                        </td> 
                        <td class="text-center">
                            <span [class]="getBadgeClass(cat.total)">
                                {{ getStatus(cat.total) }}
                            </span>
                        </td>
                        <td class="text-right font-black text-slate-900">
                            {{ cat.total | currency: 'USD':'symbol':'1.0-0' }}
                        </td> 
                    </tr>
                </ng-template>
            </p-table>
        </div>`,
})
export class RecentSalesWidget implements OnInit, OnDestroy { 
    categorySummary: any[] = []; 
    private cdr = inject(ChangeDetectorRef);
    private readonly LS_KEY = 'mis_destinos_data_v2';

    // Definición de las categorías con sus estilos
    private categoriasDef = [
        { id: 'Vuelos', nombre: 'Transporte Aéreo', icon: 'pi pi-send', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
        { id: 'Hospedaje', nombre: 'Alojamiento', icon: 'pi pi-home', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
        { id: 'Transporte', nombre: 'Movilidad Local', icon: 'pi pi-car', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        { id: 'Comida', nombre: 'Alimentación', icon: 'pi pi-utensils', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
        { id: 'Otros', nombre: 'Gastos Varios', icon: 'pi pi-tag', bgColor: 'bg-slate-50', textColor: 'text-slate-600' }
    ];

    ngOnInit() {
        this.loadFromStorage();
        window.addEventListener('storage', () => this.loadFromStorage());
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.loadFromStorage());
    }

    loadFromStorage() {
        const dataStr = localStorage.getItem(this.LS_KEY) ?? '[]';
        const destinos: any[] = JSON.parse(dataStr);

        // Mapeamos las categorías y sumamos los montos de TODOS los destinos
        this.categorySummary = this.categoriasDef.map(cat => {
            const totalAcumulado = destinos.reduce((acc, dest) => {
                const gastosCat = (dest.gastos || []).filter((g: any) => g.categoria === cat.id);
                return acc + gastosCat.reduce((sum: number, g: any) => sum + (Number(g.monto) || 0), 0);
            }, 0);

            return { ...cat, total: totalAcumulado };
        });

        this.cdr.detectChanges();
    }

    getStatus(total: number): string {
        if (total === 0) return 'SIN GASTOS';
        // Lógica de alerta si una categoría supera los $1,000 (ajustable)
        return total > 1000 ? 'ALTO' : 'ÓPTIMO';
    }

    getBadgeClass(total: number): string {
        const base = 'px-3 py-1 rounded-full text-[10px] font-black uppercase ';
        if (total === 0) return base + 'bg-slate-100 text-slate-400';
        return total > 1000 ? base + 'bg-red-100 text-red-600' : base + 'bg-emerald-100 text-emerald-600';
    }
}