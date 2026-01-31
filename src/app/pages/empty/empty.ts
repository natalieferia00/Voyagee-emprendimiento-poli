import { Component, OnInit, signal, HostListener, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightService } from '../service/flight.service'; 

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

// Interfaz completa para asegurar el tipado
interface Flight {
    _id?: string;
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
    refGastoId?: any; 
}

@Component({
    selector: 'app-vuelos',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, TagModule, InputTextModule, 
        ButtonModule, RippleModule, ToastModule, ToolbarModule, SelectModule, 
        InputNumberModule, DialogModule, ConfirmDialogModule, TextareaModule, 
        DatePickerModule, ToggleSwitchModule, CheckboxModule, TooltipModule
    ],
    providers: [ConfirmationService, MessageService, CurrencyPipe, DatePipe],
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
                                styleClass="w-full border-none shadow-none bg-transparent"
                                appendTo="body">
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

            <p-dialog [(visible)]="flightDialog" [style]="{ width: '600px' }" header="Detalles del Vuelo" [modal]="true" styleClass="p-fluid">
                <div class="flex flex-col gap-4 mt-2">
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-sm">Aerolínea</label>
                            <input pInputText [(ngModel)]="flight.airline" placeholder="Ej: Avianca" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-sm">Nº de Vuelo / Reserva</label>
                            <input pInputText [(ngModel)]="flight.flightNumber" placeholder="Ej: AV8540" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-sm">Origen</label>
                            <input pInputText [(ngModel)]="flight.origin" placeholder="Ciudad o IATA" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-sm">Destino</label>
                            <input pInputText [(ngModel)]="flight.destination" placeholder="Ciudad o IATA" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-sm">Fecha</label>
                            <p-datepicker [(ngModel)]="flight.date" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-sm">Precio (USD)</label>
                            <p-inputnumber [(ngModel)]="flight.price" mode="currency" currency="USD" locale="en-US" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-2">
                                <p-toggleswitch [(ngModel)]="flight.hasLayovers" />
                                <label class="text-sm font-semibold">¿Tiene escalas?</label>
                            </div>
                            <div *ngIf="flight.hasLayovers" class="flex flex-col gap-1">
                                <label class="text-xs text-gray-500">Número de escalas</label>
                                <p-inputnumber [(ngModel)]="flight.layoverCount" [showButtons]="true" [min]="0" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-2">
                                <p-checkbox [(ngModel)]="flight.includesBaggage" [binary]="true" inputId="bag" />
                                <label for="bag" class="text-sm font-semibold">Incluye Equipaje</label>
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-gray-500">Código de Reserva</label>
                                <input pInputText [(ngModel)]="flight.bookingCode" placeholder="ABCDEF" />
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-sm">URL del Vuelo / Link de Reserva</label>
                        <input pInputText [(ngModel)]="flight.url" placeholder="https://..." />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-sm">Descripción / Notas</label>
                        <textarea pTextarea [(ngModel)]="flight.description" rows="2" placeholder="Detalles adicionales del vuelo..."></textarea>
                    </div>
                </div>

                <ng-template #footer>
                    <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                    <p-button label="Guardar Vuelo" icon="pi pi-save" severity="success" (onClick)="saveFlight()" />
                </ng-template>
            </p-dialog>

            <p-dialog header="Vincular a Calculadora" [(visible)]="destinosDialog" [modal]="true" [style]="{width: '350px'}">
                <div class="flex flex-col gap-4">
                    <p class="text-sm">¿A qué destino quieres sumar este tiquete?</p>
                    <p-select [options]="listaDestinos" [(ngModel)]="destinoSeleccionado" optionLabel="nombre" placeholder="Selecciona destino" styleClass="w-full" appendTo="body"></p-select>
                    <p-button label="Confirmar Gasto" icon="pi pi-check" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado"></p-button>
                </div>
            </p-dialog>
        </div>
    `
})
export class Empty implements OnInit {
    private flightService = inject(FlightService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    flights = signal<Flight[]>([]);
    flight: Flight = {};
    flightDialog: boolean = false;
    destinosDialog: boolean = false;
    listaDestinos: any[] = [];
    destinoSeleccionado: any = null;
    vueloPendiente: Flight | null = null;

    statuses = [{ label: 'Reservado' }, { label: 'En proceso' }, { label: 'Descartado' }, { label: 'Visto' }];
    private readonly LS_CALC = 'mis_destinos_data_v2';

    @HostListener('window:storage')
    onExternalUpdate() { this.loadFlights(); }

    ngOnInit() { this.loadFlights(); }

    loadFlights() {
        this.flightService.getFlights().subscribe({
            next: (data: any[]) => { 
                const formated = data.map((f: any) => ({
                    ...f,
                    date: f.date ? new Date(f.date) : undefined
                }));
                this.flights.set(formated);
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fallo al cargar vuelos del servidor' })
        });
    }

    saveFlight() {
        this.flightService.saveFlight(this.flight).subscribe({
            next: (saved: any) => {
                const flightRes = saved as Flight;
                if(flightRes.date) flightRes.date = new Date(flightRes.date);
                
                let _flights = [...this.flights()];
                const idx = _flights.findIndex(f => f._id === flightRes._id);
                if (idx !== -1) _flights[idx] = flightRes;
                else _flights.push(flightRes);
                
                this.flights.set(_flights);
                
                // Si el estado es reservado y no está en la calculadora, abrir vinculación
                if (flightRes.status === 'Reservado' && !flightRes.registradoEnCalculadora) {
                    this.abrirVinculacion(flightRes);
                }
                
                this.flightDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Vuelo guardado correctamente' });
            },
            error: (err: any) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.msg || 'Error al guardar' });
            }
        });
    }

    onStatusChange(flight: Flight) {
        this.flightService.saveFlight(flight).subscribe({
            next: (res: any) => {
                const updated = res as Flight;
                if (updated.status === 'Reservado' && !updated.registradoEnCalculadora) {
                    this.abrirVinculacion(updated);
                } else if (updated.status !== 'Reservado' && updated.registradoEnCalculadora) {
                    this.eliminarGastoDeCalculadora(updated);
                }
            }
        });
    }

    abrirVinculacion(flight: Flight) {
        const data = localStorage.getItem(this.LS_CALC);
        this.listaDestinos = data ? JSON.parse(data) : [];
        if (this.listaDestinos.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Info', detail: 'No hay destinos en la calculadora para vincular.' });
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
                refId: this.vueloPendiente._id,
                categoria: 'Vuelos',
                descripcion: `Vuelo: ${this.vueloPendiente.origin} -> ${this.vueloPendiente.destination} (${this.vueloPendiente.airline})`,
                monto: this.vueloPendiente.price || 0
            };
            if (!dataCalculadora[index].gastos) dataCalculadora[index].gastos = [];
            dataCalculadora[index].gastos.push(nuevoGasto);
            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalculadora));
            
            // Sincronizar widgets
            window.dispatchEvent(new Event('storage'));

            this.vueloPendiente.registradoEnCalculadora = true;
            this.vueloPendiente.refGastoId = gastoId;
            this.flightService.saveFlight(this.vueloPendiente).subscribe();
        }
        this.destinosDialog = false;
    }

    eliminarGastoDeCalculadora(flight: Flight) {
        const dataCalculadora = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        let huboCambio = false;

        dataCalculadora.forEach((destino: any) => {
            if (destino.gastos) {
                const originalLen = destino.gastos.length;
                destino.gastos = destino.gastos.filter((g: any) => g.refId !== flight._id);
                if (destino.gastos.length !== originalLen) huboCambio = true;
            }
        });

        if (huboCambio) {
            localStorage.setItem(this.LS_CALC, JSON.stringify(dataCalculadora));
            window.dispatchEvent(new Event('storage'));
        }
        
        flight.registradoEnCalculadora = false;
        flight.refGastoId = null;
        this.flightService.saveFlight(flight).subscribe();
    }

    deleteFlight(f: Flight) {
        this.confirmationService.confirm({
            message: '¿Estás seguro de eliminar este vuelo? Se borrará también de la calculadora.',
            header: 'Confirmar eliminación',
            icon: 'pi pi-trash',
            accept: () => {
                this.flightService.deleteFlight(f._id!).subscribe({
                    next: () => {
                        this.eliminarGastoDeCalculadora(f);
                        this.flights.set(this.flights().filter(x => x._id !== f._id));
                        this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Vuelo borrado con éxito' });
                    }
                });
            }
        });
    }

    calcularTotal() { 
        return this.flights().reduce((acc, f) => acc + (f.price || 0), 0); 
    }

    getSeverity(s: string | undefined) {
        if (s === 'Reservado') return 'success';
        if (s === 'En proceso') return 'warn';
        if (s === 'Descartado') return 'danger';
        return 'secondary';
    }

    openNew() { 
        this.flight = { 
            status: 'Visto', 
            date: new Date(), 
            hasLayovers: false, 
            layoverCount: 0, 
            includesBaggage: false 
        }; 
        this.flightDialog = true; 
    }

    editFlight(f: Flight) { 
        this.flight = { ...f }; 
        this.flightDialog = true; 
    }

    hideDialog() { 
        this.flightDialog = false; 
    }
}