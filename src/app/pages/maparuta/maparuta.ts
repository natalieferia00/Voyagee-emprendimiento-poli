import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

/* ======================= INTERFACE ======================= */
interface Destino {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  icon: string;
  color: string;
}

/* ======================= STORAGE KEY ======================= */
const STORAGE_KEY = 'mapa_ruta_destinos';

@Component({
  selector: 'app-mapa-ruta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TimelineModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="card">

      <!-- BOTONES DE DESTINOS -->
      <div class="flex flex-wrap gap-2 mb-4">
        <p-button
          *ngFor="let destino of events"
          class="p-button-sm text-white"
          [label]="destino.titulo"
          [style]="{ backgroundColor: destino.color, borderColor: destino.color }"
          (onClick)="scrollToDestino(destino.id)">
        </p-button>
      </div>

      <!-- HEADER -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Mapa de Ruta de Viaje</h2>
        <p-button icon="pi pi-plus" label="Agregar destino" (onClick)="showDialog()"></p-button>
      </div>

      <!-- TIMELINE -->
      <p-timeline [value]="events" align="alternate">
        <ng-template #marker let-event>
          <span
            class="flex w-8 h-8 items-center justify-center text-white rounded-full shadow-sm"
            [style]="{ backgroundColor: event.color }">
            <i [class]="event.icon"></i>
          </span>
        </ng-template>

        <ng-template #content let-event>
          <div [attr.id]="event.id">
            <p-card [header]="event.titulo" [subheader]="event.fecha">
              <p>{{ event.descripcion }}</p>
              <div class="flex justify-end mt-2">
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  (onClick)="confirmDelete(event)">
                </p-button>
              </div>
            </p-card>
          </div>
        </ng-template>
      </p-timeline>

      <!-- DIALOG -->
      <p-dialog
        header="Agregar Destino"
        [(visible)]="visible"
        [modal]="true"
        [style]="{ width: '400px' }">

        <div class="flex flex-col gap-3">
          <label>Destino</label>
          <input pInputText [(ngModel)]="nuevoDestino.titulo" />

          <label>Descripción</label>
          <textarea pInputText rows="3" [(ngModel)]="nuevoDestino.descripcion"></textarea>

          <label>Fecha</label>
          <input type="date" pInputText [(ngModel)]="nuevoDestino.fecha" />
        </div>

        <ng-template pTemplate="footer">
          <p-button label="Cancelar" text (onClick)="visible = false"></p-button>
          <p-button label="Agregar" icon="pi pi-check" (onClick)="agregarDestino()"></p-button>
        </ng-template>
      </p-dialog>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `
})
export class MapaRutaComponent implements OnInit {

  visible = false;

  events: Destino[] = [];

  nuevoDestino: Destino = {
    id: '',
    titulo: '',
    descripcion: '',
    fecha: '',
    icon: 'pi pi-map-marker',
    color: ''
  };

  colores: string[] = [
    '#2196F3',
    '#4CAF50',
    '#FF9800',
    '#9C27B0',
    '#F44336',
    '#009688'
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  /* ======================= INIT ======================= */
  ngOnInit(): void {
    this.cargarDesdeStorage();

    if (this.events.length === 0) {
      this.events = [
        {
          id: crypto.randomUUID(),
          titulo: 'Madrid',
          descripcion: 'Llegada y recorrido inicial.',
          fecha: '2024-10-20',
          icon: 'pi pi-plane',
          color: '#2196F3'
        },
        {
          id: crypto.randomUUID(),
          titulo: 'Roma',
          descripcion: 'Tour histórico por la ciudad.',
          fecha: '2024-10-22',
          icon: 'pi pi-compass',
          color: '#4CAF50'
        }
      ];
      this.guardarEnStorage();
    }
  }

  /* ======================= STORAGE ======================= */
  guardarEnStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
  }

  cargarDesdeStorage(): void {
    this.events = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    ) as Destino[];
  }

  /* ======================= ACCIONES ======================= */
  showDialog(): void {
    this.visible = true;
  }

  agregarDestino(): void {
    if (!this.nuevoDestino.titulo || !this.nuevoDestino.fecha) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Destino y fecha son obligatorios'
      });
      return;
    }

    const color = this.colores[Math.floor(Math.random() * this.colores.length)];

    this.events.push({
      ...this.nuevoDestino,
      id: crypto.randomUUID(),
      color
    });

    this.events.sort((a, b) => a.fecha.localeCompare(b.fecha));

    this.guardarEnStorage();

    this.nuevoDestino = {
      id: '',
      titulo: '',
      descripcion: '',
      fecha: '',
      icon: 'pi pi-map-marker',
      color: ''
    };

    this.visible = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Destino agregado',
      detail: 'El destino fue guardado correctamente'
    });
  }

  confirmDelete(destino: Destino): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el destino "${destino.titulo}"?`,
      accept: () => {
        this.events = this.events.filter(d => d.id !== destino.id);
        this.guardarEnStorage();
      }
    });
  }

  scrollToDestino(id: string): void {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }
}
