import { Component, OnInit, signal, HostListener, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* PrimeNG Full Stack */
import { TableModule } from 'primeng/table';
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
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
  registradoEnCalculadora?: boolean;
  refGastoId?: number; // Referencia única para borrar en la calculadora
}

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, TagModule, InputTextModule, 
    ButtonModule, RippleModule, ToastModule, ToolbarModule, SelectModule, 
    InputNumberModule, DialogModule, ConfirmDialogModule, TextareaModule, 
    DatePickerModule, ToggleSwitchModule, CheckboxModule, TooltipModule
  ],
  providers: [ConfirmationService, MessageService, CurrencyPipe],
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
          <p-button label="Nuevo Vuelo" icon="pi pi-plus" severity="success" (onClick)="openNew()" />
        </ng-template>
      </p-toolbar>

      <p-table [value]="flights()" [rows]="10" [paginator]="true" [rowHover]="true" responsiveLayout="scroll">
        <ng-template #header>
          <tr>
            <th>Vuelo / Aerolínea</th>
            <th>Ruta</th>
            <th>Escalas</th>
            <th class="text-center">Equipaje</th>
            <th>Fecha</th>
            <th>Precio</th>
            <th style="min-width: 12rem">Estado</th>
            <th class="text-center">Link</th>
            <th>Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-flight>
          <tr>
            <td>
              <div class="font-bold">{{ flight.flightNumber || 'S/N' }}</div>
              <div class="text-xs text-secondary">{{ flight.airline }}</div>
            </td>
            <td>{{ flight.origin }} <i class="pi pi-arrow-right text-xs"></i> {{ flight.destination }}</td>
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
                (onChange)="onStatusChange(flight)"
                styleClass="w-full border-none shadow-none bg-transparent">
                <ng-template #selectedItem let-selectedOption>
                  <p-tag [value]="selectedOption.label" [severity]="getSeverity(selectedOption.label)" />
                </ng-template>
              </p-select>
            </td>
            <td class="text-center">
              <a *ngIf="flight.url" [href]="flight.url" target="_blank" class="text-blue-500">
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

      <p-dialog header="Vincular a Calculadora" [(visible)]="destinosDialog" [modal]="true" [style]="{width: '350px'}">
        <div class="flex flex-col gap-4">
            <p class="text-sm">Has marcado este vuelo como <b>Reservado</b>. ¿A qué destino quieres sumarlo como gasto?</p>
            <p-select [options]="listaDestinos" [(ngModel)]="destinoSeleccionado" optionLabel="nombre" placeholder="Selecciona destino" styleClass="w-full" appendTo="body"></p-select>
            <p-button label="Confirmar Gasto" icon="pi pi-check" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado"></p-button>
        </div>
      </p-dialog>

      <p-dialog [(visible)]="flightDialog" [style]="{ width: '550px' }" header="Detalles del Vuelo" [modal]="true" styleClass="p-fluid">
        <div class="flex flex-col gap-5 mt-2">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-bold">Aerolínea</label>
              <input pInputText [(ngModel)]="flight.airline" placeholder="Ej: Avianca" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-bold">Nº de Vuelo</label>
              <input pInputText [(ngModel)]="flight.flightNumber" placeholder="Ej: AV123" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-bold">Código Reserva</label>
              <input pInputText [(ngModel)]="flight.bookingCode" placeholder="ABC123" />
            </div>
            <div class="flex items-center pt-8">
              <p-checkbox [(ngModel)]="flight.includesBaggage" [binary]="true" inputId="bagg" />
              <label for="bagg" class="ml-2 font-bold text-sm">¿Incluye Equipaje?</label>
            </div>
          </div>

          <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded-lg">
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label class="font-bold text-sm">¿Escalas?</label>
                    <p-toggleswitch [(ngModel)]="flight.hasLayovers" />
                </div>
                <div class="flex flex-col gap-2" *ngIf="flight.hasLayovers">
                    <label class="font-bold text-sm">Nº Escalas</label>
                    <p-inputnumber [(ngModel)]="flight.layoverCount" [showButtons]="true" [min]="1" />
                </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-bold">Origen</label>
              <input pInputText [(ngModel)]="flight.origin" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-bold">Destino</label>
              <input pInputText [(ngModel)]="flight.destination" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-bold">Fecha</label>
              <p-datepicker [(ngModel)]="flight.date" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-bold">Precio (USD)</label>
              <p-inputnumber [(ngModel)]="flight.price" mode="currency" currency="USD" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm">Link de Reserva</label>
            <input pInputText [(ngModel)]="flight.url" placeholder="https://..." />
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm">Descripción / Notas</label>
            <textarea pTextarea [(ngModel)]="flight.description" rows="2"></textarea>
          </div>
        </div>

        <ng-template #footer>
            <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="hideDialog()" />
            <p-button label="Guardar Vuelo" icon="pi pi-save" severity="success" (onClick)="saveFlight()" />
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class Empty implements OnInit {
  flights = signal<Flight[]>([]);
  flight: Flight = {};
  flightDialog: boolean = false;
  destinosDialog: boolean = false;
  listaDestinos: any[] = [];
  destinoSeleccionado: any = null;
  vueloPendiente: Flight | null = null;

  statuses = [{ label: 'Reservado' }, { label: 'En proceso' }, { label: 'Descartado' }, { label: 'Visto' }];

  private readonly LS_CALC = 'mis_destinos_data_v2';
  private readonly LS_VUE = 'mis_vuelos_data_v1';

  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Escuchar cambios externos
  @HostListener('window:storage')
  onExternalUpdate() { this.loadFlights(); }

  ngOnInit() { this.loadFlights(); }

  loadFlights() {
    const saved = localStorage.getItem(this.LS_VUE);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.forEach((f: any) => { if(f.date) f.date = new Date(f.date) });
      this.flights.set(parsed);
    }
  }

  onStatusChange(flight: Flight) {
    if (flight.status === 'Reservado' && !flight.registradoEnCalculadora) {
      this.abrirVinculacion(flight);
    } else if (flight.status !== 'Reservado' && flight.registradoEnCalculadora) {
      this.eliminarGastoDeCalculadora(flight);
    }
    this.saveToLocal();
  }

  abrirVinculacion(flight: Flight) {
    const data = localStorage.getItem(this.LS_CALC);
    this.listaDestinos = data ? JSON.parse(data) : [];
    if (this.listaDestinos.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Info', detail: 'Crea un destino en la calculadora primero' });
      return;
    }
    this.vueloPendiente = flight;
    this.destinosDialog = true;
  }

  confirmarVinculacion() {
    if (!this.vueloPendiente || !this.destinoSeleccionado) return;

    const dataCalculadora = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
    const index = dataCalculadora.findIndex((d: any) => d.id === this.destinoSeleccionado.id);
    
    if (index !== -1) {
      const gastoId = Date.now();
      const nuevoGasto = {
        id: gastoId,
        categoria: 'Vuelos',
        descripcion: `Ticket: ${this.vueloPendiente.airline} (${this.vueloPendiente.origin}-${this.vueloPendiente.destination})`,
        monto: this.vueloPendiente.price || 0
      };

      if (!dataCalculadora[index].gastos) dataCalculadora[index].gastos = [];
      dataCalculadora[index].gastos.push(nuevoGasto);
      localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalculadora));
      window.dispatchEvent(new Event('storage'));

      this.vueloPendiente.registradoEnCalculadora = true;
      this.vueloPendiente.refGastoId = gastoId;
      this.saveToLocal();
      this.messageService.add({ severity: 'success', summary: 'Sincronizado', detail: 'Sumado a la calculadora' });
    }
    this.destinosDialog = false;
  }

  eliminarGastoDeCalculadora(flight: Flight) {
    if (!flight.refGastoId) return;
    const dataCalculadora = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
    let huboCambio = false;

    dataCalculadora.forEach((destino: any) => {
      if (destino.gastos) {
        const originalLen = destino.gastos.length;
        destino.gastos = destino.gastos.filter((g: any) => g.id !== flight.refGastoId);
        if (destino.gastos.length !== originalLen) huboCambio = true;
      }
    });

    if (huboCambio) {
      localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalculadora));
      window.dispatchEvent(new Event('storage'));
      flight.registradoEnCalculadora = false;
      flight.refGastoId = undefined;
    }
  }

  saveFlight() {
    let _flights = [...this.flights()];
    if (this.flight.id) {
      const idx = _flights.findIndex(f => f.id === this.flight.id);
      _flights[idx] = this.flight;
    } else {
      this.flight.id = Date.now();
      _flights.push(this.flight);
    }
    this.flights.set(_flights);
    this.saveToLocal();
    this.flightDialog = false;

    if (this.flight.status === 'Reservado') this.onStatusChange(this.flight);
  }

  deleteFlight(f: Flight) {
    this.confirmationService.confirm({
      message: `¿Borrar vuelo ${f.flightNumber}? Se eliminará también de la calculadora si está vinculado.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eliminarGastoDeCalculadora(f);
        this.flights.set(this.flights().filter(x => x.id !== f.id));
        this.saveToLocal();
        this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Vuelo quitado de la lista' });
      }
    });
  }

  saveToLocal() { localStorage.setItem(this.LS_VUE, JSON.stringify(this.flights())); }
  calcularTotal() { return this.flights().reduce((acc, f) => acc + (f.price || 0), 0); }
  
  getSeverity(s: string | undefined) {
    if (s === 'Reservado') return 'success';
    if (s === 'En proceso') return 'warn';
    if (s === 'Descartado') return 'danger';
    return 'secondary';
  }

  openNew() { this.flight = { status: 'Visto', date: new Date(), hasLayovers: false }; this.flightDialog = true; }
  editFlight(f: Flight) { this.flight = { ...f }; this.flightDialog = true; }
  hideDialog() { this.flightDialog = false; }
}