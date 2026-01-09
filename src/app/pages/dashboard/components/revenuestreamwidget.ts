import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule, CommonModule],
    template: `
    <div class="card mb-0">
        <div class="font-semibold text-xl mb-4">Gasto por Destino y Categoría</div>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>`
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    private LS_KEY = 'viajes_v10_final';

    // Categorías actualizadas según tu imagen de la calculadora
    private categorias = ['Comida', 'Transporte', 'Hospedaje', 'Vuelos', 'Otros'];

    ngOnInit() {
        this.updateChart();
        // Escucha en tiempo real cuando guardas un gasto en el modal
        window.addEventListener('storage', () => this.updateChart());
    }

    updateChart() {
        const data = localStorage.getItem(this.LS_KEY);
        const destinos: any[] = data ? JSON.parse(data) : [];
        const labels = destinos.map(d => d.nombre);
        
        const documentStyle = getComputedStyle(document.documentElement);
        
        // Colores asignados a cada una de tus categorías
        const colores = [
            '#70dfa7ff', // Comida (Verde)
            '#70dfa7ff', // Transporte (Amarillo/Naranja)
            '#70dfa7ff', // Hospedaje (Rosa)
            '#70dfa7ff', // Vuelos (Azul)
            '#70dfa7ff'  // Otros (Gris)
        ];

        const datasets = this.categorias.map((cat, i) => ({
            type: 'bar',
            label: cat,
            backgroundColor: colores[i],
            // Filtra y suma los montos de la categoría seleccionada en el modal
            data: destinos.map(d => (d.gastos || [])
                .filter((g: any) => g.categoria === cat)
                .reduce((acc: number, g: any) => acc + (g.monto || 0), 0)),
            stack: 'v1' // Apila Comida + Transporte + Hospedaje... en una sola barra
        }));

        this.chartData = { labels, datasets };
        this.chartOptions = {
            maintainAspectRatio: false,
            plugins: {
                tooltip: { 
                    mode: 'index', 
                    intersect: false,
                    callbacks: {
                        label: (c: any) => ` ${c.dataset.label}: $${c.parsed.y.toLocaleString()}`
                    }
                },
                legend: { position: 'bottom' }
            },
            scales: {
                x: { stacked: true },
                y: { 
                    stacked: true, 
                    ticks: { callback: (v: any) => '$' + v.toLocaleString() } 
                }
            }
        };
    }

    ngOnDestroy() {
        window.removeEventListener('storage', () => this.updateChart());
    }
}