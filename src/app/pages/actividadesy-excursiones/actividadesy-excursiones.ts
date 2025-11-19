import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { SliderModule } from 'primeng/slider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { ObjectUtils } from 'primeng/utils';

interface Tour {
  id: number;
  nombre: string;
  pais: string;
  duracion: string;
  precio: number;
  estado: string;
  guia: string;
  valoracion: number;
  actividad: number;
  bandera: string;
}

@Component({
  selector: 'app-actividadesy-excursiones',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    TagModule,
    ProgressBarModule,
    ToastModule,
    RatingModule,
    SliderModule,
    ToggleButtonModule,
    RippleModule,
    DividerModule
  ],
  template: `
  <div class="card">
    <h2 class="font-semibold text-xl mb-4">Gestión de Tours y Actividades</h2>

    <div class="flex justify-between items-center flex-column sm:flex-row mb-4">
      <button pButton label="Limpiar Filtros" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
      <div class="ml-auto">
        <span class="p-input-icon-left">
          <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar tour o guía" />
        </span>
      </div>
    </div>

    <p-table #dt
      [value]="tours"
      dataKey="id"
      [paginator]="true"
      [rows]="8"
      [showGridlines]="true"
      [rowHover]="true"
      [globalFilterFields]="['nombre','pais','guia','estado']"
      responsiveLayout="scroll"
    >
      <ng-template pTemplate="header">
        <tr>
          <th>Nombre</th>
          <th>País</th>
          <th>Guía</th>
          <th>Duración</th>
          <th>Precio</th>
          <th>Actividad</th>
          <th>Valoración</th>
          <th>Estado</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-tour>
        <tr>
          <td>{{ tour.nombre }}</td>
          <td>
            <div class="flex items-center gap-2">
              <img [src]="tour.bandera" alt="bandera" width="28" />
              <span>{{ tour.pais }}</span>
            </div>
          </td>
          <td>{{ tour.guia }}</td>
          <td>{{ tour.duracion }}</td>
          <td>{{ tour.precio | currency:'COP' }}</td>
          <td>
            <p-progressbar [value]="tour.actividad" [showValue]="false" [style]="{ height: '0.5rem' }" />
          </td>
          <td>
            <p-rating [ngModel]="tour.valoracion" [readonly]="true"></p-rating>
          </td>
          <td>
            <p-tag [value]="tour.estado" [severity]="getSeverity(tour.estado)"></p-tag>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr><td colspan="8">No se encontraron tours.</td></tr>
      </ng-template>
    </p-table>
  </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
    .p-input-icon-left {
      width: 250px;
    }
  `]
})
export class ActividadesyExcursionesComponent implements OnInit {
  tours: Tour[] = [];
  @ViewChild('filter') filter!: ElementRef;

  ngOnInit() {
    // Simulación de datos de tours y actividades
    this.tours = [
      {
        id: 1,
        nombre: 'Tour a Cartagena',
        pais: 'Colombia',
        duracion: '3 días / 2 noches',
        precio: 1200000,
        estado: 'Activo',
        guia: 'Laura Gómez',
        valoracion: 4,
        actividad: 90,
        bandera: 'https://flagcdn.com/w40/co.png'
      },
      {
        id: 2,
        nombre: 'Excursión al Eje Cafetero',
        pais: 'Colombia',
        duracion: '2 días / 1 noche',
        precio: 850000,
        estado: 'Pendiente',
        guia: 'Carlos Pérez',
        valoracion: 5,
        actividad: 60,
        bandera: 'https://flagcdn.com/w40/co.png'
      },
      {
        id: 3,
        nombre: 'Aventura en Machu Picchu',
        pais: 'Perú',
        duracion: '5 días / 4 noches',
        precio: 2400000,
        estado: 'Activo',
        guia: 'María Ramos',
        valoracion: 5,
        actividad: 100,
        bandera: 'https://flagcdn.com/w40/pe.png'
      },
      {
        id: 4,
        nombre: 'Safari en Kenia',
        pais: 'Kenia',
        duracion: '7 días / 6 noches',
        precio: 6000000,
        estado: 'Cancelado',
        guia: 'David Okoro',
        valoracion: 3,
        actividad: 30,
        bandera: 'https://flagcdn.com/w40/ke.png'
      }
    ];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter) this.filter.nativeElement.value = '';
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status.toLowerCase()) {
      case 'activo':
      case 'confirmado':
        return 'success';
      case 'pendiente':
        return 'warn';
      case 'cancelado':
        return 'danger';
      default:
        return 'info';
    }
  }
}
