import { Component, OnInit, inject } from '@angular/core';
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
// CORRECCIÓN: Verifica que esta ruta sea exacta a donde creaste el servicio
import { MapaRutaService } from '../service/mapa-ruta.service'; 

interface Destino {
  _id?: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-mapa-ruta',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TimelineModule, CardModule, 
    ButtonModule, DialogModule, InputTextModule, 
    ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="card p-4">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <div class="flex flex-wrap gap-2 mb-4">
        <p-button *ngFor="let destino of events" class="p-button-sm text-white" 
          [label]="destino.titulo" [style]="{ backgroundColor: destino.color, borderColor: destino.color }"
          (onClick)="scrollToDestino(destino._id!)"></p-button>
      </div>

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-slate-700">Mapa de Ruta de Viaje</h2>
        <p-button icon="pi pi-plus" label="Agregar destino" (onClick)="visible = true"></p-button>
      </div>

      <p-timeline [value]="events" align="alternate">
        <ng-template #marker let-event>
          <span class="flex w-8 h-8 items-center justify-center text-white rounded-full shadow-md" [style]="{ backgroundColor: event.color }">
            <i [class]="event.icon"></i>
          </span>
        </ng-template>
        <ng-template #content let-event>
          <div [attr.id]="event._id">
            <p-card [header]="event.titulo" [subheader]="event.fecha">
              <p>{{ event.descripcion }}</p>
              <div class="flex justify-end mt-2">
                <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="confirmDelete(event)"></p-button>
              </div>
            </p-card>
          </div>
        </ng-template>
      </p-timeline>

      <p-dialog header="Agregar Destino" [(visible)]="visible" [modal]="true" [style]="{ width: '400px' }">
        <div class="flex flex-col gap-3">
          <label class="font-bold">Destino</label>
          <input pInputText [(ngModel)]="nuevoDestino.titulo" />
          <label class="font-bold">Descripción</label>
          <textarea pInputText rows="3" [(ngModel)]="nuevoDestino.descripcion"></textarea>
          <label class="font-bold">Fecha</label>
          <input type="date" pInputText [(ngModel)]="nuevoDestino.fecha" />
        </div>
        <ng-template pTemplate="footer">
          <p-button label="Cancelar" [text]="true" (onClick)="visible = false"></p-button>
          <p-button label="Agregar" icon="pi pi-check" (onClick)="agregarDestino()"></p-button>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class MapaRutaComponent implements OnInit {
  private mapaService = inject(MapaRutaService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  visible = false;
  events: Destino[] = [];
  colores: string[] = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#009688'];

  nuevoDestino: Destino = {
    titulo: '',
    descripcion: '',
    fecha: '',
    icon: 'pi pi-map-marker',
    color: ''
  };

  ngOnInit(): void {
    this.cargarDestinos();
  }

  cargarDestinos(): void {
    this.mapaService.getDestinos().subscribe({
      next: (res: Destino[]) => {
        this.events = res.sort((a, b) => a.fecha.localeCompare(b.fecha));
      },
      error: (err: unknown) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar al backend' });
      }
    });
  }

  agregarDestino(): void {
    if (!this.nuevoDestino.titulo || !this.nuevoDestino.fecha) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Completa título y fecha' });
      return;
    }

    this.nuevoDestino.color = this.colores[Math.floor(Math.random() * this.colores.length)];

    this.mapaService.saveDestino(this.nuevoDestino).subscribe({
      next: () => {
        this.cargarDestinos();
        this.visible = false;
        this.nuevoDestino = { titulo: '', descripcion: '', fecha: '', icon: 'pi pi-map-marker', color: '' };
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Destino guardado en MongoDB' });
      },
      error: (err: unknown) => console.error(err)
    });
  }

  confirmDelete(destino: Destino): void {
    this.confirmationService.confirm({
      message: `¿Eliminar "${destino.titulo}"?`,
      accept: () => {
        if (destino._id) {
          this.mapaService.deleteDestino(destino._id).subscribe({
            next: () => this.cargarDestinos(),
            error: (err: unknown) => console.error(err)
          });
        }
      }
    });
  }

  scrollToDestino(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}