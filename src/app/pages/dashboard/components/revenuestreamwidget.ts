import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { CommonModule } from '@angular/common'; // Agregado para compatibilidad Standalone

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule, CommonModule],
    template: `<div class="card mb-8!">
        <!-- Título cambiado para reflejar el contenido de viajes -->
        <div class="font-semibold text-xl mb-4">Volumen de Reservas por Trimestre</div>
        <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-100" />
    </div>`
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any;

    chartOptions: any;

    subscription!: Subscription;

    constructor(public layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData = {
            // Eje X: Se mantienen los trimestres
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
                {
                    type: 'bar',
                    // Información de Viajes: Vuelos
                    label: 'Vuelos Reservados',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    // Datos de volumen (número de vuelos)
                    data: [25, 40, 60, 30], 
                    barThickness: 32
                },
                {
                    type: 'bar',
                    // Información de Viajes: Alojamiento
                    label: 'Noches de Hotel Reservadas',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    // Datos de volumen (número de noches)
                    data: [150, 200, 250, 180], 
                    barThickness: 32
                },
                {
                    type: 'bar',
                    // Información de Viajes: Actividades
                    label: 'Tours & Actividades',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    // Datos de volumen (número de actividades)
                    data: [80, 110, 130, 95], 
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false,
                    barThickness: 32
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                // Ajuste de tooltip para reflejar "unidades" o "volumen"
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + ' unidades';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
