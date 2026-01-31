import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule, CommonModule],
    template: `
    <div class="card mb-0 shadow-sm border-round p-4 bg-white">
        <div class="flex justify-between items-center mb-6">
            <div>
                <div class="font-bold text-xl text-slate-800">Inversión por Categoría</div>
                <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Distribución acumulada global</p>
            </div>
            <div class="p-3 bg-indigo-50 rounded-xl">
                <i class="pi pi-chart-pie text-indigo-600 text-xl"></i>
            </div>
        </div>

        <div class="h-80" *ngIf="chartData && hasData; else emptyState">
            <p-chart type="bar" [data]="chartData" [options]="chartOptions" height="300px" />
        </div>

        <ng-template #emptyState>
            <div class="h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl">
                <i class="pi pi-filter-slash text-4xl text-slate-200 mb-3"></i>
                <p class="text-slate-400 font-medium">Sin datos de gastos para graficar</p>
            </div>
        </ng-template>
    </div>`
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    hasData: boolean = false;
    
    private cdr = inject(ChangeDetectorRef);
    private readonly LS_KEY = 'mis_destinos_data_v2';
    
    // Nombres cortos para asegurar que quepan horizontalmente
    private categorias = [
        { id: 'Vuelos', label: 'Tiquetes' },
        { id: 'Hospedaje', label: 'Hospedaje' },
        { id: 'Comida', label: 'Comida' },
        { id: 'Transporte', label: 'Transporte' },
        { id: 'Otros', label: 'Otros' }
    ];
    
    // Colores consistentes con el resto de tus widgets
    private colores = ['#f59e0b', '#a855f7', '#10b981', '#3b82f6', '#94a3b8'];

    ngOnInit() {
        this.updateChart();
        // Escucha cambios globales para actualizar el gráfico automáticamente
        window.addEventListener('storage', () => this.updateChart());
    }

    updateChart() {
        const dataStr = localStorage.getItem(this.LS_KEY) ?? '[]';
        const destinos: any[] = JSON.parse(dataStr);

        const labels = this.categorias.map(c => c.label);
        
        // Sumar montos de todos los destinos por cada categoría
        const totalesGlobales = this.categorias.map(cat => {
            return destinos.reduce((acc, dest) => {
                const gastosCat = (dest.gastos || []).filter((g: any) => g.categoria === cat.id);
                return acc + gastosCat.reduce((sum: number, g: any) => sum + (Number(g.monto) || 0), 0);
            }, 0);
        });

        this.hasData = totalesGlobales.some(t => t > 0);

        this.chartData = {
            labels: labels,
            datasets: [{
                label: 'Gastos Totales',
                backgroundColor: this.colores,
                borderRadius: 8,
                data: totalesGlobales,
                barThickness: 40 // Controla el ancho de la barra para que no se vea gigante
            }]
        };

        this.setupOptions();
        this.cdr.detectChanges();
    }

    setupOptions() {
        const textColorSecondary = '#64748b'; 
        const surfaceBorder = '#f1f5f9';

        this.chartOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 12,
                    callbacks: {
                        label: (c: any) => ` Total: $${c.parsed.y.toLocaleString()}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: textColorSecondary, 
                        font: { weight: '600', size: 11 },
                        // ESTA ES LA CLAVE: Evita que los títulos se pongan en diagonal
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: false
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        font: { size: 11 },
                        callback: (v: any) => '$' + v.toLocaleString()
                    },
                    grid: { color: surfaceBorder }
                }
            },
            // Animación suave al cargar
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.updateChart());
    }
}