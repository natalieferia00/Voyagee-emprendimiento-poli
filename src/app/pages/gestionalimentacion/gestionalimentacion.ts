// Importaciones de Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importaciones de PrimeNG (Solo las necesarias para la tabla de Restaurantes)
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext'; 
import { ButtonModule } from 'primeng/button'; 

// Interfaces
interface Restaurant {
    id: number;
    name: string;
    cuisine: string; 
    rating: number; 
    priceRange: string;
    address: string;
    favoriteDish?: string;
}

@Component({
    selector: 'app-gestion-alimentacion',
    standalone: true,
    imports: [
        // Módulos de Angular
        CommonModule,
        FormsModule,
        
        // Módulos de PrimeNG
        TableModule,
        TagModule,
        RatingModule,
        InputTextModule,
        ButtonModule
    ],
    template: `
    <div class="card">
    <div class="font-semibold text-xl mb-4">Gestión de Restaurantes</div>
    <p-table [value]="restaurants" [tableStyle]="{ 'min-width': '60rem' }" [paginator]="true" [rows]="5" [rowHover]="true" [showGridlines]="true">
            
            <ng-template #caption>
                <div class="flex justify-content-end">
                    <button pButton label="Agregar Restaurante" icon="pi pi-plus" class="p-button-success"></button>
                </div>
            </ng-template>

            <ng-template #header>
                <tr>
                    <th style="width: 20rem" pSortableColumn="name">Restaurante <p-sortIcon field="name" /></th>
                    <th style="width: 12rem" pSortableColumn="cuisine">Tipo de Cocina <p-sortIcon field="cuisine" /></th>
                    <th style="width: 10rem" pSortableColumn="rating">Calificación <p-sortIcon field="rating" /></th>
                    <th style="width: 10rem" pSortableColumn="priceRange">Precio <p-sortIcon field="priceRange" /></th>
                    <th pSortableColumn="address">Dirección <p-sortIcon field="address" /></th>
                    <th style="width: 15rem" pSortableColumn="favoriteDish">Plato Estrella <p-sortIcon field="favoriteDish" /></th>
                    <th style="width: 8rem">Acciones</th>
                </tr>
            </ng-template>
            <ng-template #body let-restaurant>
                <tr>
                    <td class="font-medium">{{ restaurant.name }}</td>
                    <td>
                        <p-tag [value]="restaurant.cuisine" [severity]="getSeverity(restaurant.cuisine)" />
                    </td>
                    <td>
                        <p-rating [ngModel]="restaurant.rating" [readonly]="true" [stars]="5" />
                    </td>
                    <td>{{ restaurant.priceRange }}</td>
                    <td>{{ restaurant.address }}</td>
                    <td>{{ restaurant.favoriteDish }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" styleClass="mr-2" />
                        <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" />
                    </td>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr>
                    <td colspan="7">No hay restaurantes disponibles.</td>
                </tr>
            </ng-template>
    </p-table>
    </div>
    `,
    styles: [`
    /* Estilos para tags de restaurantes para mejor visualización */
    .p-tag[value="Americana"] {
        background: var(--surface-400); 
        color: var(--surface-900);
    }
    .p-tag[value="Italiana"] {
        background: #66BB6A; 
    }
    .p-tag[value="Mexicana"] {
        background: #EF5350; 
    }
    .p-tag[value="Japonesa"], .p-tag[value="Hindú"] {
        background: #26C6DA; 
    }
    `],
    providers: [ConfirmationService, MessageService] 
})
export class GestionAlimentacionComponent implements OnInit {
    
    // Solo mantenemos el array de restaurantes
    restaurants: Restaurant[] = []; 

    constructor() { }

    ngOnInit() {
        // --- Datos Estáticos de Restaurantes ---
        this.restaurants = [
            { id: 1, name: 'Casa Bella Trattoria', cuisine: 'Italiana', rating: 4.5, priceRange: '$$$', address: 'Calle Falsa 123', favoriteDish: 'Lasagna de la Nona' },
            { id: 2, name: 'Tacos "El Rápido"', cuisine: 'Mexicana', rating: 4.2, priceRange: '$$', address: 'Avenida Siempre Viva 456', favoriteDish: 'Tacos al Pastor' },
            { id: 3, name: 'Sushi Zen', cuisine: 'Japonesa', rating: 4.8, priceRange: '$$$$', address: 'Plaza Central 789', favoriteDish: 'Dragon Roll' },
            { id: 4, name: 'Burger Queen', cuisine: 'Americana', rating: 3.9, priceRange: '$$', address: 'Boulevard de los Sueños 101', favoriteDish: 'Doble Queso' },
            { id: 5, name: 'Aromas de la India', cuisine: 'Hindú', rating: 4.6, priceRange: '$$$', address: 'Calle Luna 202', favoriteDish: 'Pollo Tikka Masala' }
        ];
    }

    /**
     * Define la severidad (color) del p-tag basándose en el tipo de cocina.
     * Se han mapeado a los colores estándar de PrimeNG.
     */
    getSeverity(cuisine: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
        const lowerCuisine = cuisine.toLowerCase();
        
        switch (lowerCuisine) {
            case 'italiana':
                return 'success';
            case 'mexicana':
                return 'danger';
            case 'japonesa':
            case 'hindú':
                return 'info';
            case 'americana':
                return 'secondary';
            case 'china':
                return 'warn';
            default:
                return 'contrast';
        }
    }
}