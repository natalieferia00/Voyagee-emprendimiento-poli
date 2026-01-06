import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

interface Flight {
  id?: number;
  flightNumber?: string;
  airline?: string;
  bookingCode?: string;
  hasLayovers?: boolean;
  layoverCount?: number;
  includesBaggage?: boolean;
  origin?: string;
  destination?: string;
  date?: Date | string;
  price?: number;
  status?: string;
  description?: string;
  url?: string;
}

@Component({
  selector: 'app-gestion-vuelos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, TagModule, InputTextModule, 
    ButtonModule, RippleModule, ToastModule, ToolbarModule, SelectModule, 
    InputNumberModule, DialogModule, InputIconModule, IconFieldModule, 
    ConfirmDialogModule, ProgressBarModule, TextareaModule, DatePickerModule,
    ToggleSwitchModule, CheckboxModule, TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
      <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl text-800">Gestión de Vuelos</div>
          <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                 [value]="'Inversión Vuelos: ' + (calcularTotal() | currency:'USD':'symbol':'1.0-2')" />
      </div>

      <p-toolbar styleClass="mb-6">
        <ng-template #start>
          <p-button label="Nuevo Vuelo" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
        </ng-template>
      </p-toolbar>

      <p-table #dt [value]="flights()" [rows]="10" [paginator]="true" [rowHover]="true" dataKey="id">
        <ng-template #header>
          <tr>
            <th>Vuelo / Aerolínea</th>
            <th>Reserva</th>
            <th>Ruta</th>
            <th style="max-width: 150px">Descripción</th> 
            <th>Escalas</th>
            <th class="text-center">Equipaje</th>
            <th>Fecha</th>
            <th>Precio</th>
            <th style="min-width: 14rem">Estado</th>
            <th class="text-center">Link</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-flight>
          <tr>
            <td>
              <div class="font-bold">{{ flight.flightNumber }}</div>
              <div class="text-xs text-secondary">{{ flight.airline }}</div>
            </td>
            <td><p-tag *ngIf="flight.bookingCode" [value]="flight.bookingCode" severity="secondary" /></td>
            <td>{{ flight.origin }} <i class="pi pi-arrow-right text-xs"></i> {{ flight.destination }}</td>
            
            <td>
              <div class="text-xs text-overflow-ellipsis overflow-hidden whitespace-nowrap" 
                   style="max-width: 140px; cursor: help;" 
                   [pTooltip]="flight.description" 
                   tooltipPosition="top">
                {{ flight.description || '---' }}
              </div>
            </td>

            <td>
              <p-tag *ngIf="flight.hasLayovers" [value]="flight.layoverCount + ' Escalas'" severity="warn" />
              <span *ngIf="!flight.hasLayovers" class="text-xs text-green-500 font-medium">Directo</span>
            </td>
            <td class="text-center">
              <i class="pi" [ngClass]="{'pi-briefcase text-blue-500': flight.includesBaggage, 'pi-times text-400': !flight.includesBaggage}"></i>
            </td>
            <td>{{ flight.date | date: 'dd/MM/yyyy' }}</td>
            <td class="font-semibold text-primary">{{ flight.price | currency: 'USD' }}</td>
            
            <td>
              <p-select 
                [(ngModel)]="flight.status" 
                [options]="statuses" 
                optionLabel="label" 
                optionValue="label"
                styleClass="w-full border-none shadow-none bg-transparent"
                appendTo="body">
                <ng-template #selectedItem let-selectedOption>
                  <p-tag [value]="selectedOption.label" [severity]="getSeverity(selectedOption.label)" />
                </ng-template>
                <ng-template let-option #item>
                  <p-tag [value]="option.label" [severity]="getSeverity(option.label)" />
                </ng-template>
              </p-select>
            </td>

            <td class="text-center">
              <a *ngIf="flight.url" [href]="flight.url" target="_blank" class="p-button p-button-rounded p-button-text p-button-info">
                <i class="pi pi-external-link"></i>
              </a>
            </td>

            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (onClick)="editFlight(flight)" />
                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (onClick)="deleteFlight(flight)" />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-dialog [(visible)]="flightDialog" [style]="{ width: '550px' }" header="Detalles del Vuelo" [modal]="true" styleClass="p-fluid">
        <ng-template #content>
          <div class="flex flex-col gap-5 mt-2">
            
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="font-bold text-800">Aerolínea</label>
                <input pInputText [(ngModel)]="flight.airline" placeholder="Ej: Avianca" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-bold text-800">Nº de Vuelo</label>
                <input pInputText [(ngModel)]="flight.flightNumber" placeholder="Ej: AV123" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="font-bold text-800">Código de Reserva</label>
                <input pInputText [(ngModel)]="flight.bookingCode" placeholder="ABC123" />
              </div>
              <div class="flex items-center pt-8">
                <p-checkbox [(ngModel)]="flight.includesBaggage" [binary]="true" inputId="baggCheck" />
                <label for="baggCheck" class="ml-2 font-bold text-800">¿Incluye Equipaje?</label>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 border-round-lg">
              <div class="flex flex-col gap-2">
                <label class="font-bold text-sm">¿Tiene Escalas?</label>
                <p-toggleswitch [(ngModel)]="flight.hasLayovers" />
              </div>
              <div class="flex flex-col gap-2" *ngIf="flight.hasLayovers">
                <label class="font-bold text-sm">Cantidad de Escalas</label>
                <p-inputnumber [(ngModel)]="flight.layoverCount" [showButtons]="true" [min]="1" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="font-bold text-800">Origen</label>
                <input pInputText [(ngModel)]="flight.origin" placeholder="Ej: BOG" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-bold text-800">Destino</label>
                <input pInputText [(ngModel)]="flight.destination" placeholder="Ej: JFK" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="font-bold text-800">Fecha del Vuelo</label>
                <p-datepicker [(ngModel)]="flight.date" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body" />
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-bold text-800">Precio (USD)</label>
                <p-inputnumber [(ngModel)]="flight.price" mode="currency" currency="USD" locale="en-US" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-bold text-800">URL de la Reserva / Check-in</label>
              <div class="p-inputgroup">
                <span class="p-inputgroup-addon"><i class="pi pi-link"></i></span>
                <input pInputText [(ngModel)]="flight.url" placeholder="https://..." />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="font-bold text-800">Descripción / Notas de Viaje</label>
              <textarea pTextarea [(ngModel)]="flight.description" rows="3" style="resize: none" placeholder="Terminal, puerta de embarque, requisitos de visa..."></textarea>
            </div>
          </div>
        </ng-template>

        <ng-template #footer>
          <div class="flex justify-end gap-2">
              <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="hideDialog()" />
              <p-button label="Guardar Vuelo" icon="pi pi-save" severity="success" (onClick)="saveFlight()" />
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class Empty implements OnInit {
  flights = signal<Flight[]>([]);
  flight: Flight = {};
  flightDialog: boolean = false;
  statuses = [{ label: 'Reservado' }, { label: 'En proceso' }, { label: 'Descartado' }, { label: 'Visto' }];

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.flights.set([{ 
      id: 1, flightNumber: 'AV123', airline: 'Avianca', bookingCode: 'ABC12', 
      origin: 'BOG', destination: 'JFK', date: new Date(), price: 450, 
      status: 'Reservado', hasLayovers: false, includesBaggage: true,
      url: 'https://www.avianca.com', description: 'Terminal 1, puerta 5. Llegar 3h antes.' 
    }]);
  }

  // FUNCIÓN PARA EL PRESUPUESTO TOTAL
  calcularTotal() {
    return this.flights().reduce((acc, f) => acc + (f.price || 0), 0);
  }

  getSeverity(status: string | undefined) {
    switch (status) {
      case 'Reservado': return 'success';
      case 'En proceso': return 'warn';
      case 'Descartado': return 'danger';
      default: return 'secondary';
    }
  }

  openNew() {
    this.flight = { status: 'Visto', date: new Date(), hasLayovers: false, layoverCount: 0, includesBaggage: false, description: '' };
    this.flightDialog = true;
  }

  editFlight(flight: Flight) {
    this.flight = { ...flight };
    this.flightDialog = true;
  }

  saveFlight() {
    if (this.flight.flightNumber?.trim()) {
      let _flights = [...this.flights()];
      if (this.flight.id) {
        const index = _flights.findIndex(f => f.id === this.flight.id);
        _flights[index] = this.flight;
      } else {
        this.flight.id = Math.floor(Math.random() * 1000);
        _flights.push(this.flight);
      }
      this.flights.set(_flights);
      this.flightDialog = false;
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Vuelo guardado' });
    }
  }

  deleteFlight(flight: Flight) {
    this.confirmationService.confirm({
      message: `¿Eliminar el vuelo ${flight.flightNumber}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.flights.set(this.flights().filter(f => f.id !== flight.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Registro borrado' });
      }
    });
  }

  hideDialog() { this.flightDialog = false; }
}