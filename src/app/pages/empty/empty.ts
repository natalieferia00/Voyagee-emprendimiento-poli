import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { ObjectUtils } from 'primeng/utils';

// ✈️ Interfaz base para un vuelo
interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  date: string;
  price: number;
  status: string;
  description: string;
  progress: number;
  url: string; // ✅ Nuevo campo para la URL
}

// ✅ Extendemos para incluir la fecha convertida
interface FlightWithParsedDate extends Flight {
  parsedDate?: Date;
}

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [
    TableModule,
    MultiSelectModule,
    SelectModule,
    InputIconModule,
    TagModule,
    InputTextModule,
    SliderModule,
    ProgressBarModule,
    ToggleButtonModule,
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    RatingModule,
    RippleModule,
    IconFieldModule
  ],
  template: `
    <div class="card">
      <div class="font-semibold text-xl mb-4">Gestión de Vuelos</div>

      <p-table
        #dt1
        [value]="flights"
        dataKey="id"
        [rows]="10"
        [loading]="loading"
        [rowHover]="true"
        [showGridlines]="true"
        [paginator]="true"
        [globalFilterFields]="['flightNumber', 'origin', 'destination', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template #caption>
          <div class="flex justify-between items-center flex-column sm:flex-row">
            <button
              pButton
              label="Limpiar"
              class="p-button-outlined mb-2"
              icon="pi pi-filter-slash"
              (click)="clear(dt1)"
            ></button>
            <p-iconfield iconPosition="left" class="ml-auto">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter(dt1, $event)"
                placeholder="Buscar vuelo..."
              />
            </p-iconfield>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th>Número</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Fecha</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Descripción</th>
            <th>Progreso</th>
            <th>URL</th> <!-- ✅ Nueva columna -->
          </tr>
        </ng-template>

        <ng-template #body let-flight>
          <tr>
            <td>{{ flight.flightNumber }}</td>
            <td>{{ flight.origin }}</td>
            <td>{{ flight.destination }}</td>
            <td>{{ flight.parsedDate || flight.date | date: 'dd/MM/yyyy' }}</td>
            <td>{{ flight.price | currency: 'USD' }}</td>
            <td>
              <p-tag
                [value]="flight.status"
                [severity]="getSeverity(flight.status)"
              ></p-tag>
            </td>
            <td>{{ flight.description }}</td>
            <td>
              <p-progressbar
                [value]="flight.progress"
                [showValue]="false"
                [style]="{ height: '0.5rem' }"
              ></p-progressbar>
            </td>
            <td>
              <a
                *ngIf="flight.url"
                [href]="flight.url"
                target="_blank"
                class="text-blue-500 underline"
                >Ver vuelo</a
              >
            </td>
          </tr>
        </ng-template>

        <ng-template #emptymessage>
          <tr><td colspan="9">No se encontraron vuelos.</td></tr>
        </ng-template>

        <ng-template #loadingbody>
          <tr><td colspan="9">Cargando datos...</td></tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [
    `
      .p-datatable-frozen-tbody {
        font-weight: bold;
      }
      .p-datatable-scrollable .p-frozen-column {
        font-weight: bold;
      }
    `
  ],
  providers: [ConfirmationService, MessageService]
})
export class Empty implements OnInit {
  flights: FlightWithParsedDate[] = [];
  loading: boolean = true;
  @ViewChild('filter') filter!: ElementRef;

  ngOnInit() {
    // ✈️ Datos de ejemplo
    const flightData: Flight[] = [
      {
        id: 1,
        flightNumber: 'AV123',
        origin: 'Bogotá',
        destination: 'Medellín',
        date: '2025-11-02',
        price: 180.5,
        status: 'Reservado',
        description: 'Vuelo nacional con escala corta.',
        progress: 100,
        url: 'https://www.avianca.com/co/es' // ✅ Ejemplo URL
      },
      {
        id: 2,
        flightNumber: 'LA456',
        origin: 'Cali',
        destination: 'Cartagena',
        date: '2025-11-10',
        price: 230,
        status: 'En proceso',
        description: 'Vuelo programado sujeto a confirmación.',
        progress: 60,
        url: 'https://www.latamairlines.com/co/es'
      },
      {
        id: 3,
        flightNumber: 'IB789',
        origin: 'Bogotá',
        destination: 'Madrid',
        date: '2025-12-05',
        price: 900,
        status: 'Descartado',
        description: 'Vuelo cancelado por mantenimiento.',
        progress: 0,
        url: 'https://www.iberia.com/co/'
      }
    ];

    // ✅ Convertimos fechas sin modificar tipo original
    this.flights = flightData.map(flight => ({
      ...flight,
      parsedDate: new Date(flight.date)
    }));

    this.loading = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter) this.filter.nativeElement.value = '';
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | null {
    switch (status.toLowerCase()) {
      case 'reservado':
        return 'success';
      case 'en proceso':
        return 'warn';
      case 'descartado':
        return 'danger';
      default:
        return 'info';
    }
  }
}
