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

// Interfaz para el objeto de Viaje
interface Viaje {
  id: number;
  origen: string;
  destino: string;
  fechaSalida: Date;
  transportista: 'Aéreo' | 'Marítimo' | 'Terrestre';
  estado: 'pendiente' | 'en curso' | 'entregado' | 'cancelado';
  costo: number;
  urlSeguimiento: string; // URL o ID de seguimiento
  prioridad: number; // Valor de 0 a 100 para la barra de progreso
}

@Component({
  selector: 'app-gestiondetransporte',
  standalone: true, // <-- Componente Standalone
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
  templateUrl: './gestiondetransporte.html',
  styleUrl: './gestiondetransporte.scss',
  providers: [MessageService, ConfirmationService]
})
export class Gestiondetransporte implements OnInit {
  viajes: Viaje[] = [];
  estadosViaje: any[] = [];
  transportistas: any[] = [];

  loading: boolean = true;

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.viajes = this.getViajesData();
    this.loading = false;

    // Opciones para el filtro de Estado
    this.estadosViaje = [
      { label: 'Pendiente', value: 'pendiente' },
      { label: 'En Curso', value: 'en curso' },
      { label: 'Entregado', value: 'entregado' },
      { label: 'Cancelado', value: 'cancelado' }
    ];

    // Opciones para el filtro de Transportista
    this.transportistas = [
      { name: 'Transporte Aéreo', value: 'Aéreo' },
      { name: 'Transporte Marítimo', value: 'Marítimo' },
      { name: 'Transporte Terrestre', value: 'Terrestre' }
    ];
  }

  // Datos estáticos de ejemplo
  getViajesData(): Viaje[] {
    return [
      {
        id: 1001,
        origen: 'BOG',
        destino: 'MAD',
        fechaSalida: new Date('2025-11-15'),
        transportista: 'Aéreo',
        estado: 'pendiente',
        costo: 1500.50,
        urlSeguimiento: 'https://rastreo.com/trk1001',
        prioridad: 85
      },
      {
        id: 1002,
        origen: 'BAQ',
        destino: 'NYC',
        fechaSalida: new Date('2025-11-01'),
        transportista: 'Marítimo',
        estado: 'entregado',
        costo: 3200.00,
        urlSeguimiento: 'https://rastreo.com/trk1002',
        prioridad: 92
      },
      {
        id: 1003,
        origen: 'CLO',
        destino: 'LIM',
        fechaSalida: new Date('2025-11-10'),
        transportista: 'Terrestre',
        estado: 'en curso',
        costo: 450.75,
        urlSeguimiento: 'https://rastreo.com/trk1003',
        prioridad: 70
      },
      {
        id: 1004,
        origen: 'CTG',
        destino: 'BOG',
        fechaSalida: new Date('2025-10-25'),
        transportista: 'Terrestre',
        estado: 'cancelado',
        costo: 120.00,
        urlSeguimiento: 'https://rastreo.com/trk1004',
        prioridad: 50
      },
      {
        id: 1005,
        origen: 'MDE',
        destino: 'MEX',
        fechaSalida: new Date('2025-11-20'),
        transportista: 'Aéreo',
        estado: 'pendiente',
        costo: 890.99,
        urlSeguimiento: 'https://rastreo.com/trk1005',
        prioridad: 98
      }
    ];
  }

  // Aplica filtro global
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Limpia todos los filtros
  clearFilter() {
    this.dt1.clear();
    if (this.filter.nativeElement) {
      this.filter.nativeElement.value = '';
    }
  }

  getSeverity(estado: Viaje['estado']): 'success' | 'warn' | 'danger' | 'info' {
  switch (estado) {
    case 'entregado':
      return 'success';
    case 'en curso':
      return 'warn'; // <-- ¡Cambio clave aquí! De 'warning' a 'warn'
    case 'cancelado':
      return 'danger';
    case 'pendiente':
    default:
      return 'info';
  }
}

  // Formatea el costo a moneda (ejemplo con COP)
  formatCurrency(value: number) {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
  }

  // Formatea la fecha de salida
  formatDate(date: Date) {
      return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
}