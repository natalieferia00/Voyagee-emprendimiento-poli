import { Component, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule, CurrencyPipe } from '@angular/common';

// Interfaz simple para los datos de destino
interface Destination {
    city: string;
    country: string;
    budget: number; // Costo estimado del viaje
    date: string; // Fecha del viaje
}

@Component({
    standalone: true,
    // Selector original, aunque el contenido es de destinos
    selector: 'app-recent-sales-widget', 
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, CurrencyPipe], 
    template: `
        <div class="card mb-8!">
            <!-- Título que refleja el nuevo contenido de viajes -->
            <div class="font-semibold text-xl mb-4"> Destinos Recientes</div>
            <p-table [value]="destinations" [paginator]="true" [rows]="5" responsiveLayout="scroll">
                <ng-template pTemplate="header">
                    <tr>
                        <!-- Icono -->
                        <th>Mapa</th> 
                        <th pSortableColumn="city">Ciudad <p-sortIcon field="city"></p-sortIcon></th>
                        <th pSortableColumn="country">País <p-sortIcon field="country"></p-sortIcon></th>
                        <th pSortableColumn="budget">Presupuesto <p-sortIcon field="budget"></p-sortIcon></th>
                        <th>Ver</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-destination>
                    <tr>
                        <!-- Icono de mapa (pi pi-map-marker) -->
                        <td style="width: 15%; min-width: 5rem;">
                            <i class="pi pi-map-marker text-2xl text-primary"></i> 
                        </td>
                        <!-- Datos de la Ciudad -->
                        <td style="width: 35%; min-width: 7rem;">{{ destination.city }}</td> 
                        <!-- Datos del País -->
                        <td style="width: 35%; min-width: 7rem;">{{ destination.country }}</td>
                        <!-- Presupuesto con formato de moneda -->
                        <td style="width: 35%; min-width: 8rem;">{{ destination.budget | currency: 'USD' }}</td> 
                        <td style="width: 15%;">
                            <!-- Botón de Ver Detalles (Icono de ojo) -->
                            <button pButton pRipple type="button" icon="pi pi-eye" class="p-button p-component p-button-text p-button-icon-only"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>`,
    providers: [] 
})
// Nombre de clase original
export class RecentSalesWidget implements OnInit { 
    destinations!: Destination[]; 

    ngOnInit() {
        this.destinations = [
            { city: 'Tokio', country: 'Japón', budget: 3500, date: '2024-11-15' },
            { city: 'Nueva York', country: 'EE. UU.', budget: 2800, date: '2024-10-20' },
            { city: 'Roma', country: 'Italia', budget: 1900, date: '2024-09-01' },
            { city: 'Cusco', country: 'Perú', budget: 1500, date: '2024-07-28' },
            { city: 'Sídney', country: 'Australia', budget: 4200, date: '2024-06-10' }
        ];
    }
}
