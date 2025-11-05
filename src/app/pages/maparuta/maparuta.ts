import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// ==========================================================
// COMPONENTE 1: MapaRutaComponent (Tu componente de viaje)
// ==========================================================

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
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Mapa de Ruta de Viaje</h2>
        <p-button icon="pi pi-plus" label="Agregar actividad" (onClick)="showDialog()"></p-button>
      </div>

      <p-timeline [value]="events" align="alternate" styleClass="customized-timeline">
        <ng-template #marker let-event>
          <span class="flex w-8 h-8 items-center justify-center text-white rounded-full z-10 shadow-sm" [style]="{ 'background-color': event.color }">
            <i [class]="event.icon"></i>
          </span>
        </ng-template>
        <ng-template #content let-event>
          <p-card [header]="event.titulo" [subheader]="event.fecha">
            <p>{{ event.descripcion }}</p>
            <div class="flex justify-end mt-2">
              <p-button icon="pi pi-trash" severity="danger" text (onClick)="confirmDelete(event)"></p-button>
            </div>
          </p-card>
        </ng-template>
      </p-timeline>

      <p-dialog header="Agregar Actividad" [(visible)]="visible" [modal]="true" [style]="{ width: '400px' }">
        <div class="flex flex-col gap-3">
          <label for="titulo">Título</label>
          <input id="titulo" pInputText [(ngModel)]="nuevoEvento.titulo" placeholder="Ej: Hotel, Vuelo, Excursión" />

         <label for="descripcion">Descripción</label>
<textarea 
  id="descripcion" 
  pInputText 
  [(ngModel)]="nuevoEvento.descripcion" 
  rows="3" 
  placeholder="Detalles del evento">
</textarea>

          <label for="fecha">Fecha</label>
          <input id="fecha" type="date" pInputText [(ngModel)]="nuevoEvento.fecha" />
        </div>

        <ng-template pTemplate="footer">
          <p-button label="Cancelar" icon="pi pi-times" text (onClick)="visible=false"></p-button>
          <p-button label="Agregar" icon="pi pi-check" (onClick)="agregarEvento()"></p-button>
        </ng-template>
      </p-dialog>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `
})
export class MapaRutaComponent implements OnInit {
  visible = false;
  events: any[] = [];
  nuevoEvento = { titulo: '', descripcion: '', fecha: '', icon: 'pi pi-map-marker', color: '#2196F3' };

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) { }

  ngOnInit(): void {
    // Inicializar con datos para que el timeline sea visible al cargar
    this.events = [
      { titulo: 'Llegada al Destino', descripcion: 'Vuelo aéreo y recogida de equipaje.', fecha: '2024-10-20', icon: 'pi pi-plane', color: '#607D8B' },
      { titulo: 'Check-in en Hotel', descripcion: 'Registro en el Hotel Central.', fecha: '2024-10-20', icon: 'pi pi-home', color: '#4CAF50' },
      { titulo: 'Visita Histórica', descripcion: 'Tour guiado por el centro de la ciudad.', fecha: '2024-10-21', icon: 'pi pi-compass', color: '#FF9800' }
    ];
  }

  showDialog() {
    this.visible = true;
  }

  agregarEvento() {
    if (this.nuevoEvento.titulo && this.nuevoEvento.descripcion && this.nuevoEvento.fecha) {
      this.events.push({ ...this.nuevoEvento });

      // Ordenar por fecha para mantener la ruta cronológica
      this.events.sort((a, b) => {
        if (a.fecha < b.fecha) return -1;
        if (a.fecha > b.fecha) return 1;
        return 0;
      });

      this.nuevoEvento = { titulo: '', descripcion: '', fecha: '', icon: 'pi pi-map-marker', color: '#2196F3' };
      this.visible = false;
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'Actividad añadida al mapa de ruta' });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Todos los campos son obligatorios' });
    }
  }

  confirmDelete(event: any) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar "${event.titulo}" del mapa de ruta?`,
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.events = this.events.filter(e => e !== event);
        this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Actividad eliminada correctamente' });
      }
    });
  }
}

// ==========================================================
// COMPONENTE 2: TimelineDemo (El componente de demostración)
// *Es válido tener varios componentes en un solo archivo si son standalone y no están anidados*
// ==========================================================

@Component({
  selector: 'app-timeline-demo',
  standalone: true,
  imports: [CommonModule, TimelineModule, ButtonModule, CardModule],
  template: `
    <div class="grid grid-cols-12 gap-8">
      </div>
  `
})
export class TimelineDemo implements OnInit {
  events1: any[] = [];
  events2: any[] = [];

  ngOnInit() {
    this.events1 = [
      { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
      { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
      { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-envelope', color: '#FF9800' },
      { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
    ];

    this.events2 = ['2020', '2021', '2022', '2023'];
  }
}