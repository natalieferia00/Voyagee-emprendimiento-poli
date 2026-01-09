import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

/* PrimeNG */
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

interface Gasto {
    id: number;
    categoria: string;
    descripcion: string;
    monto: number;
}

interface Destino {
    id: number;
    nombre: string;
    presupuestoAsignado: number;
    gastos: Gasto[];
}

@Component({
    selector: 'app-calculadora-gastos',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, 
        InputTextModule, InputNumberModule, DialogModule, 
        ToastModule, ConfirmDialogModule, TagModule, CardModule
    ],
    providers: [MessageService, ConfirmationService, CurrencyPipe],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog [style]="{width: '450px'}"></p-confirmDialog>

        <div class="p-5">
            <p-card header=" Mi Presupuesto de Viaje">
                <div class="flex mb-4 gap-2">
                    <p-button label="Nuevo Destino" icon="pi pi-plus" (onClick)="showDestinoDialog()"></p-button>
                </div>

                <p-table [value]="destinos" [rows]="10" styleClass="p-datatable-gridlines">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Destino</th>
                            <th>Presupuesto</th>
                            <th>Total Gastado</th>
                            <th>Balance</th>
                            <th style="width: 15rem">Acciones</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-destino>
                        <tr>
                            <td><span class="font-bold text-lg">{{ destino.nombre }}</span></td>
                            <td>{{ destino.presupuestoAsignado | currency:'USD' }}</td>
                            <td class="text-primary font-bold">{{ calcularTotalDestino(destino) | currency:'USD' }}</td>
                            <td>
                                <p-tag [severity]="getBadgeSeverity(destino)" 
                                       [value]="(destino.presupuestoAsignado - calcularTotalDestino(destino) | currency:'USD') ?? ''">
                                </p-tag>
                            </td>
                            <td>
                                <div class="flex gap-2">
                                    <p-button icon="pi pi-eye" pTooltip="Ver detalle" 
                                              styleClass="p-button-rounded p-button-info p-button-text" 
                                              (onClick)="verDetalle(destino)"></p-button>
                                    
                                    <p-button icon="pi pi-plus" label="Gasto" 
                                              styleClass="p-button-rounded p-button-success p-button-sm" 
                                              (onClick)="showGastoDialog(destino)"></p-button>
                                              
                                    <p-button icon="pi pi-trash" 
                                              styleClass="p-button-rounded p-button-danger p-button-text" 
                                              (onClick)="eliminarDestino(destino)"></p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <p-dialog [header]="'Desglose de Gastos: ' + (destinoSeleccionado?.nombre ?? '')" 
                  [(visible)]="displayDetalleDialog" 
                  [modal]="true" 
                  [style]="{width: '500px'}">
            
            <p-table [value]="destinoSeleccionado?.gastos ?? []" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Categoría</th>
                        <th>Descripción</th>
                        <th class="text-right">Monto</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-gasto>
                    <tr>
                        <td><p-tag [value]="gasto.categoria" severity="secondary"></p-tag></td>
                        <td>{{ gasto.descripcion }}</td>
                        <td class="text-right font-bold">{{ gasto.monto | currency:'USD' }}</td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="footer">
                    <tr>
                        <td colspan="2" class="text-right font-bold">Total Acumulado:</td>
                        <td class="text-right text-primary font-bold">
                            {{ calcularTotalDestino(destinoSeleccionado!) | currency:'USD' }}
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="3" class="text-center p-4">No hay gastos registrados aún.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-dialog>

        <p-dialog [header]="'Nuevo Gasto para ' + (destinoActual?.nombre ?? '')" [(visible)]="displayGastoDialog" [modal]="true" [style]="{width: '350px'}">
            <div class="p-fluid">
                <div class="field mb-3">
                    <label class="font-bold">Categoría</label>
                    <select class="p-inputtext w-full" [(ngModel)]="nuevoGasto.categoria">
                        <option value="" disabled selected>Seleccione...</option>
                        <option *ngFor="let cat of opcionesCategorias" [value]="cat.value">{{ cat.label }}</option>
                    </select>
                </div>
                <div class="field mb-3">
                    <label class="font-bold">Descripción</label>
                    <input pInputText [(ngModel)]="nuevoGasto.descripcion" placeholder="Ej: Ticket de tren" />
                </div>
                <div class="field">
                    <label class="font-bold">Monto</label>
                    <p-inputNumber [(ngModel)]="nuevoGasto.monto" mode="currency" currency="USD"></p-inputNumber>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Añadir" icon="pi pi-check" (onClick)="agregarGasto()"></p-button>
            </ng-template>
        </p-dialog>

        <p-dialog header="Nuevo Destino" [(visible)]="displayDestinoDialog" [modal]="true" [style]="{width: '350px'}">
            <div class="p-fluid">
                <div class="field mb-3"><label class="font-bold">Nombre del Lugar</label><input pInputText [(ngModel)]="nuevoDestino.nombre" /></div>
                <div class="field"><label class="font-bold">Presupuesto Inicial</label><p-inputNumber [(ngModel)]="nuevoDestino.presupuestoAsignado" mode="currency" currency="USD"></p-inputNumber></div>
            </div>
            <ng-template pTemplate="footer"><p-button label="Guardar" icon="pi pi-check" (onClick)="agregarDestino()"></p-button></ng-template>
        </p-dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculadoraGastosComponent implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private LS_KEY = 'viajes_v6_data';

    destinos: Destino[] = [];
    destinoActual?: Destino;
    destinoSeleccionado?: Destino; // Para el ojito

    displayDestinoDialog = false;
    displayGastoDialog = false;
    displayDetalleDialog = false; // Control del ojito

    opcionesCategorias = [
        { label: ' Comida', value: 'Comida' },
        { label: ' Transporte', value: 'Transporte' },
        { label: ' Hospedaje', value: 'Hospedaje' },
        { label: ' Vuelos', value: 'Vuelos' },
        { label: ' Otros', value: 'Otros' }
    ];

    nuevoDestino: Destino = this.resetDestino();
    nuevoGasto: Gasto = this.resetGasto();

    ngOnInit() { this.cargarLocalStorage(); }

    // --- Lógica del "Ojito" ---
    verDetalle(destino: Destino) {
        this.destinoSeleccionado = destino;
        this.displayDetalleDialog = true;
    }

    // --- Persistencia ---
    private guardarLocalStorage() { localStorage.setItem(this.LS_KEY, JSON.stringify(this.destinos)); }
    private cargarLocalStorage() {
        const stored = localStorage.getItem(this.LS_KEY);
        if (stored) this.destinos = JSON.parse(stored);
    }

    // --- Acciones ---
    showDestinoDialog() { this.nuevoDestino = this.resetDestino(); this.displayDestinoDialog = true; }

    agregarDestino() {
        if (this.nuevoDestino.nombre.trim()) {
            this.destinos = [...this.destinos, { ...this.nuevoDestino, id: Date.now(), gastos: [] }];
            this.guardarLocalStorage();
            this.displayDestinoDialog = false;
        }
    }

    eliminarDestino(destino: Destino) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar ${destino.nombre}?`,
            accept: () => {
                this.destinos = this.destinos.filter(d => d.id !== destino.id);
                this.guardarLocalStorage();
            }
        });
    }

    showGastoDialog(destino: Destino) {
        this.destinoActual = destino;
        this.nuevoGasto = this.resetGasto();
        this.displayGastoDialog = true;
    }

    agregarGasto() {
        if (this.destinoActual && this.nuevoGasto.monto > 0 && this.nuevoGasto.categoria) {
            const index = this.destinos.findIndex(d => d.id === this.destinoActual?.id);
            if (index !== -1) {
                this.destinos[index].gastos = [...this.destinos[index].gastos, { ...this.nuevoGasto, id: Date.now() }];
                this.destinos = [...this.destinos];
                this.guardarLocalStorage();
                this.displayGastoDialog = false;
                
                // Si el detalle estaba abierto, lo actualizamos
                if (this.destinoSeleccionado?.id === this.destinoActual.id) {
                    this.destinoSeleccionado = this.destinos[index];
                }
            }
        }
    }

    calcularTotalDestino(destino: Destino): number {
        if (!destino) return 0;
        return (destino.gastos || []).reduce((acc: number, g: Gasto) => acc + g.monto, 0);
    }

    getBadgeSeverity(destino: Destino): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
        const resto = destino.presupuestoAsignado - this.calcularTotalDestino(destino);
        return resto < 0 ? 'danger' : 'success';
    }

    private resetDestino(): Destino { return { id: 0, nombre: '', presupuestoAsignado: 0, gastos: [] }; }
    private resetGasto(): Gasto { return { id: 0, categoria: '', descripcion: '', monto: 0 }; }
}