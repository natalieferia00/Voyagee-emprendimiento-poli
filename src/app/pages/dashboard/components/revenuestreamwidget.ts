import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule, CommonModule],
    template: `
    <div class="card mb-0">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl">Distribución de Gastos por Destino</div>
            <i class="pi pi-chart-bar text-muted-color text-xl"></i>
        </div>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>`
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    
    // Llave sincronizada con la calculadora maestra
    private readonly LS_KEY = 'mis_destinos_data_v2';

    // Categorías alineadas con las opciones del modal de la calculadora
    private categorias = ['Vuelos', 'Comida', 'Hospedaje', 'Transporte', 'Otros'];

    ngOnInit() {
        this.updateChart();
        // Escucha cambios en tiempo real (al agregar/quitar gastos o destinos)
        window.addEventListener('storage', () => this.updateChart());
    }

    updateChart() {
        const dataStr = localStorage.getItem(this.LS_KEY) ?? '[]';
        const destinos: any[] = JSON.parse(dataStr);
        const labels = destinos.map(d => d.nombre);
        
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        
        // Paleta de colores vibrantes para diferenciar las categorías
        const colores = [
            '#8effb7ff', // Vuelos (Naranja)
            '#8effb7ff', // Comida (Cian)
            '#8effb7ff', // Hospedaje (Rosa)
            '#8effb7ff', // Transporte (Verde)
            '#8effb7ff'  // Otros (Morado)
        ];

        const datasets = this.categorias.map((cat, i) => ({
            type: 'bar',
            label: cat,
            backgroundColor: colores[i],
            hoverBackgroundColor: colores[i].replace(')', ', 0.8)'), // Efecto hover suave
            data: destinos.map(d => (d.gastos || [])
                .filter((g: any) => g.categoria === cat)
                .reduce((acc: number, g: any) => acc + (g.monto || 0), 0)),
            stack: 'viaje-stack', // Esto hace que las barras se apilen una sobre otra
            borderRadius: 4
        }));

        this.chartData = { labels, datasets };
        
        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                tooltip: { 
                    mode: 'index', 
                    intersect: false,
                    callbacks: {
                        label: (c: any) => ` ${c.dataset.label}: $${c.parsed.y.toLocaleString()}`
                    }
                },
                legend: { 
                    position: 'bottom',
                    labels: { color: textColorSecondary, usePointStyle: true }
                }
            },
            scales: {
                x: { 
                    stacked: true,
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder, display: false }
                },
                y: { 
                    stacked: true, 
                    ticks: { 
                        color: textColorSecondary,
                        callback: (v: any) => '$' + v.toLocaleString() 
                    },
                    grid: { color: surfaceBorder }
                }
            }
        };
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.updateChart());
    }
}