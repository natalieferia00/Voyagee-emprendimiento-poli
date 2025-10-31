import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <!-- Métrica 1: Reservas Totales -->
                    <span class="block text-muted-color font-medium mb-4">Reservas Totales</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">452</div>
                </div>
                <!-- Ícono de Avión (pi-plane) -->
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-plane text-blue-500 text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">18 nuevas </span>
            <span class="text-muted-color">esta semana</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <!-- Métrica 2: Ingresos por Viajes -->
                    <span class="block text-muted-color font-medium mb-4">Ingresos por Viajes</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">$14,500</div>
                </div>
                <!-- Ícono de Billetera (pi-wallet) -->
                <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-wallet text-orange-500 text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">25% más </span>
            <span class="text-muted-color">que el mes pasado</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <!-- Métrica 3: Destinos Únicos -->
                    <span class="block text-muted-color font-medium mb-4">Destinos Únicos</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">98</div>
                </div>
                <!-- Ícono de Mundo (pi-globe) -->
                <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-globe text-cyan-500 text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">12 nuevos </span>
            <span class="text-muted-color">en el último trimestre</span>
        </div>
    </div>
    
    <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <!-- Métrica 4: Asistencia Requerida -->
                    <span class="block text-muted-color font-medium mb-4">Asistencia Requerida</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">5 tickets abiertos</div>
                </div>
                <!-- Ícono de Pregunta (pi-question-circle) -->
                <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-question-circle text-purple-500 text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">95% </span>
            <span class="text-muted-color">solucionado a tiempo</span>
        </div>
    </div>
    `
})
export class StatsWidget {}
