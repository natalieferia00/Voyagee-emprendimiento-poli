// Importaciones de Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
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
    description: string;
}

@Component({
    selector: 'app-gestion-alimentacion',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        TagModule,
        RatingModule,
        InputTextModule,
        ButtonModule
    ],
    template: `
    <div class="card">
        <div class="font-semibold text-xl mb-4">Gestión de Restaurantes</div>

        <p-table 
            [value]="restaurants" 
            [tableStyle]="{ 'min-width': '60rem' }" 
            [paginator]="true" 
            [rows]="5"
            [rowHover]="true" 
            [showGridlines]="true">

            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="name">Restaurante <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="cuisine">Tipo de Cocina <p-sortIcon field="cuisine"></p-sortIcon></th>
                    <th pSortableColumn="rating">Calificación <p-sortIcon field="rating"></p-sortIcon></th>
                    <th pSortableColumn="priceRange">Precio <p-sortIcon field="priceRange"></p-sortIcon></th>
                    <th>Descripción</th>
                    <th style="width: 8rem">Acciones</th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-restaurant>
                <tr>
                    <td>{{ restaurant.name }}</td>

                    <td>
                        <p-tag 
                            [value]="restaurant.cuisine" 
                            [severity]="getSeverity(restaurant.cuisine)">
                        </p-tag>
                    </td>

                    <td>
                        <p-rating [ngModel]="restaurant.rating" [readonly]="true" [stars]="5"></p-rating>
                    </td>

                    <td>{{ restaurant.priceRange }}</td>

                    <td>{{ restaurant.description }}</td>

                    <td>
                        <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="secondary" styleClass="mr-2"></p-button>
                        <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger"></p-button>
                    </td>
                </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="6">No hay restaurantes disponibles.</td>
                </tr>
            </ng-template>
        </p-table>
    </div>
    `,
    styles: [`
    .p-tag[value="Americana"] { background: var(--surface-400); color: var(--surface-900); }
    .p-tag[value="Italiana"] { background: #66BB6A; }
    .p-tag[value="Mexicana"] { background: #EF5350; }
    .p-tag[value="Japonesa"], 
    .p-tag[value="Hindú"] { background: #26C6DA; }
    `],
    providers: [ConfirmationService, MessageService]
})
export class GestionAlimentacionComponent implements OnInit {

    restaurants: Restaurant[] = [];

    ngOnInit() {
        this.restaurants = [
            { id: 1, name: 'Casa Bella Trattoria', cuisine: 'Italiana', rating: 4.5, priceRange: '$$$', description: 'Calle Falsa 123' },
            { id: 2, name: 'Tacos "El Rápido"', cuisine: 'Mexicana', rating: 4.2, priceRange: '$$', description: 'Avenida Siempre Viva 456' },
            { id: 3, name: 'Sushi Zen', cuisine: 'Japonesa', rating: 4.8, priceRange: '$$$$', description: 'Plaza Central 789' },
            { id: 4, name: 'Burger Queen', cuisine: 'Americana', rating: 3.9, priceRange: '$$', description: 'Boulevard de los Sueños 101' },
            { id: 5, name: 'Aromas de la India', cuisine: 'Hindú', rating: 4.6, priceRange: '$$$', description: 'Calle Luna 202' }
        ];
    }

    getSeverity(cuisine: string) {
        const c = cuisine.toLowerCase();
        switch (c) {
            case 'italiana': return 'success';
            case 'mexicana': return 'danger';
            case 'japonesa':
            case 'hindú': return 'info';
            case 'americana': return 'secondary';
            case 'china': return 'warn';
            default: return 'contrast';
        }
    }
}
