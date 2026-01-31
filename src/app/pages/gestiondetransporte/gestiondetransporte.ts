import { Component, OnInit, signal, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { TransportService } from '../service/transport.service';

interface Viaje {
    id?: string;
    _id?: string;
    origen?: string;
    destino?: string;
    medioTransporte?: string;
    estado?: string;
    costo?: number;
    urlProveedor?: string;
    descripcion?: string;
    registradoEnCalculadora?: boolean;
}

@Component({
    selector: 'app-gestion-transporte',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule, ButtonModule, ToastModule,
        ToolbarModule, InputTextModule, TextareaModule, SelectModule,
        DialogModule, TagModule, InputIconModule, IconFieldModule, 
        ConfirmDialogModule, InputNumberModule, TooltipModule
    ],
    providers: [MessageService, ConfirmationService, CurrencyPipe],
    template: `
        <p-toast />
        <p-confirmdialog />

        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <div class="font-semibold text-xl text-800">Logística de Transporte</div>
                <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                       [value]="'Gasto Transporte: ' + (calcularTotal() | currency:'USD')" />
            </div>

            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button label="Nuevo Viaje" icon="pi pi-plus" severity="success" (onClick)="openNew()" />
                </ng-template>
            </p-toolbar>

            <p-table [value]="viajes()" [rows]="10" [paginator]="true" [rowHover]="true">
                <ng-template #header>
                    <tr>
                        <th>Origen ➔ Destino</th>
                        <th>Medio</th>
                        <th>Costo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template #body let-v>
                    <tr>
                        <td>
                            <div class="font-bold">{{v.origen}} <i class="pi pi-arrow-right text-xs mx-1"></i> {{v.destino}}</div>
                            <a *ngIf="v.urlProveedor" [href]="v.urlProveedor" target="_blank" class="text-xs text-blue-500 underline">Ver Reserva</a>
                        </td>
                        <td><p-tag [value]="v.medioTransporte" severity="secondary" /></td>
                        <td class="font-bold text-primary">{{v.costo | currency:'USD'}}</td>
                        <td>
                            <p-select [(ngModel)]="v.estado" [options]="estados" optionLabel="label" optionValue="value" 
                                      (onChange)="onStatusChange(v)" styleClass="w-full border-none bg-transparent" appendTo="body">
                                <ng-template #selectedItem let-item>
                                    <p-tag [value]="item.label.toUpperCase()" [severity]="getSeverity(item.value)" />
                                </ng-template>
                            </p-select>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (onClick)="editViaje(v)" />
                                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (onClick)="deleteViaje(v)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <p-dialog header="Sumar a la Calculadora" [(visible)]="destinosDialog" [modal]="true" [style]="{width: '350px'}">
                <div class="flex flex-col gap-4">
                    <p class="text-sm">¿A qué destino pertenece este gasto de transporte?</p>
                    <p-select [options]="listaDestinos" [(ngModel)]="destinoSeleccionado" optionLabel="nombre" placeholder="Selecciona destino" styleClass="w-full" appendTo="body"></p-select>
                    <p-button label="Confirmar" icon="pi pi-check" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado" severity="success"></p-button>
                </div>
            </p-dialog>

            <p-dialog [(visible)]="viajeDialog" [style]="{ width: '450px' }" header="Detalles del Transporte" [modal]="true">
                <div class="flex flex-col gap-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Origen</label>
                            <input pInputText [(ngModel)]="viaje.origen" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Destino</label>
                            <input pInputText [(ngModel)]="viaje.destino" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Medio</label>
                            <p-select [(ngModel)]="viaje.medioTransporte" [options]="mediosTransporte" optionLabel="label" optionValue="value" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold">Costo (USD)</label>
                            <p-inputnumber [(ngModel)]="viaje.costo" mode="currency" currency="USD" locale="en-US" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-bold">Proveedor / URL</label>
                        <input pInputText [(ngModel)]="viaje.urlProveedor" placeholder="https://..." />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-bold">Notas</label>
                        <textarea pTextarea [(ngModel)]="viaje.descripcion" rows="3"></textarea>
                    </div>
                </div>
                <ng-template #footer>
                    <p-button label="Cancelar" [text]="true" (onClick)="hideDialog()" />
                    <p-button label="Guardar" icon="pi pi-save" (onClick)="saveViaje()" severity="success" />
                </ng-template>
            </p-dialog>
        </div>
    `
})
export class Gestiondetransporte implements OnInit {
    private transportService = inject(TransportService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    viajes = signal<Viaje[]>([]);
    viaje: Viaje = {};
    viajeDialog: boolean = false;
    destinosDialog: boolean = false;
    listaDestinos: any[] = [];
    destinoSeleccionado: any = null;
    viajePendiente: Viaje | null = null;
    submitted: boolean = false;

    mediosTransporte = [
        { label: 'Aéreo', value: 'Aéreo' },
        { label: 'Marítimo', value: 'Marítimo' },
        { label: 'Terrestre', value: 'Terrestre' },
        { label: 'Alquiler', value: 'Alquiler' }
    ];

    estados = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Visto', value: 'visto' },
        { label: 'Reservado', value: 'reservado' }
    ];

    private readonly LS_CALC = 'mis_destinos_data_v2';

    ngOnInit() { this.loadData(); }

    loadData() {
        this.transportService.getTransports().subscribe(data => {
            this.viajes.set(data.map(t => ({ ...t, id: t._id })));
        });
    }

    saveViaje() {
        if (!this.viaje.origen || !this.viaje.destino) return;
        const body = { ...this.viaje, _id: this.viaje.id };
        this.transportService.saveTransport(body).subscribe(res => {
            this.messageService.add({ severity: 'success', summary: 'Guardado' });
            this.loadData();
            if (this.viaje.estado === 'reservado' && !this.viaje.registradoEnCalculadora) {
                this.abrirVinculacion({ ...this.viaje, id: res._id });
            }
            this.viajeDialog = false;
        });
    }

    onStatusChange(v: Viaje) {
        if (v.estado === 'reservado' && !v.registradoEnCalculadora) {
            this.abrirVinculacion(v);
        } else if (v.estado !== 'reservado' && v.registradoEnCalculadora) {
            this.syncCalculadora(v, 'delete');
        }
        this.transportService.saveTransport({ ...v, _id: v.id }).subscribe();
    }

    abrirVinculacion(v: Viaje) {
        const data = localStorage.getItem(this.LS_CALC);
        this.listaDestinos = data ? JSON.parse(data) : [];
        if (this.listaDestinos.length === 0) return;
        this.viajePendiente = v;
        this.destinosDialog = true;
    }

    confirmarVinculacion() {
        if (!this.viajePendiente || !this.destinoSeleccionado) return;
        this.syncCalculadora(this.viajePendiente, 'add');
        this.viajePendiente.registradoEnCalculadora = true;
        this.transportService.saveTransport({ ...this.viajePendiente, _id: this.viajePendiente.id }).subscribe();
        this.destinosDialog = false;
    }

    private syncCalculadora(v: Viaje, action: 'add' | 'delete') {
        const data = JSON.parse(localStorage.getItem(this.LS_CALC) || '[]');
        if (action === 'add') {
            const idx = data.findIndex((d: any) => d.id === this.destinoSeleccionado.id);
            if (idx !== -1) {
                if (!data[idx].gastos) data[idx].gastos = [];
                data[idx].gastos.push({ id: Date.now(), refId: v.id, categoria: 'Transporte', descripcion: `Viaje: ${v.origen}-${v.destino}`, monto: v.costo || 0 });
            }
        } else {
            data.forEach((d: any) => {
                if (d.gastos) d.gastos = d.gastos.filter((g: any) => g.refId !== v.id);
            });
        }
        localStorage.setItem(this.LS_CALC, JSON.stringify(data));
        window.dispatchEvent(new Event('storage'));
    }

    deleteViaje(v: Viaje) {
        this.confirmationService.confirm({
            message: '¿Eliminar transporte?',
            accept: () => {
                this.transportService.deleteTransport(v.id!).subscribe(() => {
                    this.syncCalculadora(v, 'delete');
                    this.loadData();
                });
            }
        });
    }

    calcularTotal() { return this.viajes().reduce((acc, v) => acc + (v.costo || 0), 0); }
    getSeverity(s: any) {
        if (s === 'reservado') return 'success';
        if (s === 'visto') return 'info';
        return 'warn';
    }
    openNew() { this.viaje = { estado: 'pendiente' }; this.viajeDialog = true; }
    editViaje(v: Viaje) { this.viaje = { ...v }; this.viajeDialog = true; }
    hideDialog() { this.viajeDialog = false; }
}