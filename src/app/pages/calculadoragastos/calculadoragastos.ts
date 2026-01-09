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
        <p-confirmDialog></p-confirmDialog>

        <div class="p-4">
            <p-card header="Presupuesto">
                <div class="flex mb-4">
                    <p-button label="Nuevo Destino" icon="pi pi-plus" (onClick)="showDestinoDialog()"></p-button>
                </div>

                <p-table [value]="destinos" styleClass="p-datatable-sm" [responsiveLayout]="'scroll'">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Destino</th>
                            <th>Presupuesto</th>
                            <th>Gastado</th>
                            <th>Balance</th>
                            <th style="width: 12rem" class="text-center">Acciones</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-destino>
                        <tr>
                            <td><span class="font-bold text-700">{{ destino.nombre }}</span></td>
                            <td>{{ destino.presupuestoAsignado | currency:'USD' }}</td>
                            <td class="text-primary font-bold">{{ calcularTotalDestino(destino) | currency:'USD' }}</td>
                            <td>
                                <p-tag [severity]="getBadgeSeverity(destino)" 
                                       [value]="(destino.presupuestoAsignado - calcularTotalDestino(destino) | currency:'USD') ?? ''">
                                </p-tag>
                            </td>
                            <td class="flex justify-content-center gap-2">
                                <p-button icon="pi pi-eye" styleClass="p-button-rounded p-button-text" (onClick)="verDetalle(destino)"></p-button>
                                <p-button icon="pi pi-plus" label="Gasto" styleClass="p-button-sm p-button-success" (onClick)="showGastoDialog(destino)"></p-button>
                                <p-button icon="pi pi-trash" styleClass="p-button-sm p-button-danger p-button-text" (onClick)="eliminarDestino(destino)"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <p-dialog [header]="'Nuevo Gasto para ' + (destinoActual?.nombre ?? '')" [(visible)]="displayGastoDialog" 
                  [modal]="true" [style]="{width: '350px'}" [draggable]="false">
            <div class="p-fluid">
                <div class="field mb-3">
                    <label class="block font-bold mb-1">Categoría</label>
                    <select class="p-inputtext w-full" [(ngModel)]="nuevoGasto.categoria">
                        <option value="" disabled selected>Seleccione...</option>
                        <option *ngFor="let cat of opcionesCategorias" [value]="cat.value">{{ cat.label }}</option>
                    </select>
                </div>

                <div class="field mb-3">
                    <label class="block font-bold mb-1">Descripción</label>
                    <input pInputText [(ngModel)]="nuevoGasto.descripcion" placeholder="¿En qué se gastó?" />
                </div>

                <div class="field mb-3">
                    <label class="block font-bold mb-1">Monto (USD)</label>
                    <p-inputNumber [(ngModel)]="nuevoGasto.monto" mode="currency" currency="USD" locale="en-US"></p-inputNumber>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" icon="pi pi-times" (onClick)="displayGastoDialog = false" styleClass="p-button-text p-button-secondary"></p-button>
                <p-button label="Guardar" icon="pi pi-check" (onClick)="agregarGasto()"></p-button>
            </ng-template>
        </p-dialog>

        <p-dialog header="Registrar Destino" [(visible)]="displayDestinoDialog" 
                  [modal]="true" [style]="{width: '350px'}" [draggable]="false">
            <div class="p-fluid">
                <div class="field mb-3">
                    <label class="block font-bold mb-1">Nombre del Destino</label>
                    <input pInputText [(ngModel)]="nuevoDestino.nombre" placeholder="Ej: Madrid" />
                </div>
                <div class="field mb-3">
                    <label class="block font-bold mb-1">Presupuesto</label>
                    <p-inputNumber [(ngModel)]="nuevoDestino.presupuestoAsignado" mode="currency" currency="USD"></p-inputNumber>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Crear" icon="pi pi-check" (onClick)="agregarDestino()"></p-button>
            </ng-template>
        </p-dialog>

        <p-dialog [header]="'Desglose: ' + (destinoSeleccionado?.nombre ?? '')" [(visible)]="displayDetalleDialog" [modal]="true" [style]="{width: '400px'}">
            <p-table [value]="destinoSeleccionado?.gastos ?? []" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Cat.</th>
                        <th>Detalle</th>
                        <th class="text-right">Monto</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-gasto>
                    <tr>
                        <td><p-tag [value]="gasto.categoria" severity="info"></p-tag></td>
                        <td>{{ gasto.descripcion }}</td>
                        <td class="text-right font-bold">{{ gasto.monto | currency:'USD' }}</td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="3" class="text-center p-3">No hay gastos.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculadoraGastosComponent implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private LS_KEY = 'viajes_v10_final';

    destinos: Destino[] = [];
    destinoActual?: Destino;
    destinoSeleccionado?: Destino;
    displayDestinoDialog = false;
    displayGastoDialog = false;
    displayDetalleDialog = false;

    opcionesCategorias = [
        { label: 'Comida', value: 'Comida' },
        { label: 'Transporte', value: 'Transporte' },
        { label: 'Hospedaje', value: 'Hospedaje' },
        { label: 'Vuelos', value: 'Vuelos' },
        { label: 'Otros', value: 'Otros' }
    ];

    nuevoDestino: Destino = this.resetDestino();
    nuevoGasto: Gasto = this.resetGasto();

    ngOnInit() { this.cargarLocalStorage(); }

    verDetalle(destino: Destino) {
        this.destinoSeleccionado = destino;
        this.displayDetalleDialog = true;
    }

    private guardarLocalStorage() { localStorage.setItem(this.LS_KEY, JSON.stringify(this.destinos)); }
    private cargarLocalStorage() {
        const stored = localStorage.getItem(this.LS_KEY);
        if (stored) this.destinos = JSON.parse(stored);
    }

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
            message: `¿Eliminar viaje a ${destino.nombre}?`,
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
            }
        }
    }

    calcularTotalDestino(destino: Destino): number {
        return (destino.gastos || []).reduce((acc: number, g: Gasto) => acc + g.monto, 0);
    }

    getBadgeSeverity(destino: Destino): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
        const resto = destino.presupuestoAsignado - this.calcularTotalDestino(destino);
        return resto < 0 ? 'danger' : 'success';
    }

    private resetDestino(): Destino { return { id: 0, nombre: '', presupuestoAsignado: 0, gastos: [] }; }
    private resetGasto(): Gasto { return { id: 0, categoria: '', descripcion: '', monto: 0 }; }
}