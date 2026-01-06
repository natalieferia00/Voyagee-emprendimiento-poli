import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

interface GastoAlimentacion {
    id?: number;
    nombre?: string;
    categoria?: string; 
    rating?: number;
    costoEstimado?: number;
    description?: string;
    url?: string;
    estado?: string;
}

@Component({
    selector: 'app-gestion-alimentacion',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, TagModule, RatingModule,
        InputTextModule, ButtonModule, ToolbarModule, DialogModule,
        SelectModule, InputNumberModule, TextareaModule, ConfirmDialogModule, ToastModule
    ],
    template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl">Gestión de Alimentación y Gastos</div>
            <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                   [value]="'Presupuesto Total: ' + (calcularTotal() | currency:'COP':'symbol':'1.0-0')" />
        </div>

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nuevo Gasto" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="gastos()" [rows]="10" [paginator]="true" [rowHover]="true" [showGridlines]="true">
            <ng-template #header>
                <tr>
                    <th>Descripción / Lugar</th>
                    <th>Categoría</th>
                    <th>Costo Estimado</th>
                    <th style="min-width: 12rem">Estado (Cambio Rápido)</th>
                    <th>Valoración</th>
                    <th style="width: 8rem">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-gasto>
                <tr>
                    <td>
                        <div class="font-bold text-800">{{ gasto.nombre }}</div>
                        <a *ngIf="gasto.url" [href]="gasto.url" target="_blank" class="text-xs text-blue-500 hover:underline flex items-center gap-1">
                            <i class="pi pi-external-link" style="font-size: 0.7rem"></i> Ver Referencia
                        </a>
                    </td>
                    <td>
                        <p-tag [value]="gasto.categoria" [severity]="getSeverityCategoria(gasto.categoria)" />
                    </td>
                    <td class="font-semibold text-primary">
                        {{ gasto.costoEstimado | currency:'COP':'symbol':'1.0-0' }}
                    </td>
                    
                    <td>
                        <p-select 
                            [(ngModel)]="gasto.estado" 
                            [options]="estados" 
                            (onChange)="onStatusChange(gasto, $event.value)"
                            styleClass="w-full border-none bg-transparent shadow-none"
                            appendTo="body">
                            <ng-template #selectedItem let-selectedOption>
                                <p-tag [value]="selectedOption.label" [severity]="getSeverityStatus(selectedOption.value)" />
                            </ng-template>
                            <ng-template let-option #item>
                                <p-tag [value]="option.label" [severity]="getSeverityStatus(option.value)" />
                            </ng-template>
                        </p-select>
                    </td>

                    <td><p-rating [(ngModel)]="gasto.rating" [readonly]="true" /></td>
                    
                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" severity="info" (onClick)="editGasto(gasto)" />
                            <p-button icon="pi pi-trash" [rounded]="true" [outlined]="true" severity="danger" (onClick)="deleteGasto(gasto)" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="gastoDialog" [style]="{ width: '550px' }" header="Detalles del Gasto" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    
                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-900">Lugar o Concepto</label>
                        <input type="text" pInputText [(ngModel)]="gasto.nombre" placeholder="Ej: Supermercado, Restaurante, Snacks..." autofocus />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Categoría</label>
                            <p-select [(ngModel)]="gasto.categoria" [options]="categorias" placeholder="Seleccionar" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Estado</label>
                            <p-select [(ngModel)]="gasto.estado" [options]="estados" optionLabel="label" optionValue="value" placeholder="Seleccionar" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Costo Estimado (COP)</label>
                            <p-inputnumber [(ngModel)]="gasto.costoEstimado" mode="currency" currency="COP" locale="es-CO" placeholder="$ 0" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Valoración</label>
                            <div class="pt-2">
                                <p-rating [(ngModel)]="gasto.rating" />
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-900">URL / Menú / Ubicación</label>
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon"><i class="pi pi-link"></i></span>
                            <input type="text" pInputText [(ngModel)]="gasto.url" placeholder="https://..." />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-900">Notas Adicionales</label>
                        <textarea pTextarea [(ngModel)]="gasto.description" rows="4" style="resize: none" placeholder="Detalles sobre platos, horarios o recomendaciones..."></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                    <p-button label="Guardar Gasto" icon="pi pi-check" severity="success" (onClick)="saveGasto()" />
                </div>
            </ng-template>
        </p-dialog>
    </div>
    `,
    providers: [ConfirmationService, MessageService]
})
export class GestionAlimentacionComponent implements OnInit {

    gastos = signal<GastoAlimentacion[]>([]);
    gasto: GastoAlimentacion = {};
    gastoDialog: boolean = false;

    categorias = ['Restaurante', 'Supermercado', 'Panadería', 'Calle / Snack', 'Otros'];
    
    estados = [
        { label: 'Visto', value: 'Visto' },
        { label: 'Reservado', value: 'Reservado' },
        { label: 'Pendiente', value: 'Pendiente' },
        { label: 'Descartado', value: 'Descartado' }
    ];

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.gastos.set([
            { id: 1, nombre: 'Supermercado Éxito', categoria: 'Supermercado', costoEstimado: 120000, estado: 'Pendiente' },
            { id: 2, nombre: 'Restaurante El Cielo', categoria: 'Restaurante', costoEstimado: 250000, estado: 'Reservado', rating: 5 },
            { id: 3, nombre: 'Panadería Tradicional', categoria: 'Panadería', costoEstimado: 20000, estado: 'Visto' }
        ]);
    }

    calcularTotal() {
        return this.gastos().reduce((acc, g) => acc + (g.costoEstimado || 0), 0);
    }

    openNew() {
        this.gasto = { rating: 0, estado: 'Visto', categoria: 'Restaurante', costoEstimado: 0 };
        this.gastoDialog = true;
    }

    editGasto(g: GastoAlimentacion) {
        this.gasto = { ...g };
        this.gastoDialog = true;
    }

    onStatusChange(g: GastoAlimentacion, nuevoEstado: string) {
        this.messageService.add({ severity: 'info', summary: 'Actualizado', detail: `${g.nombre} -> ${nuevoEstado}` });
    }

    saveGasto() {
        if (this.gasto.nombre?.trim()) {
            let _gastos = [...this.gastos()];
            if (this.gasto.id) {
                const index = _gastos.findIndex(r => r.id === this.gasto.id);
                _gastos[index] = this.gasto;
            } else {
                this.gasto.id = Math.floor(Math.random() * 1000);
                _gastos.push(this.gasto);
            }
            this.gastos.set(_gastos);
            this.gastoDialog = false;
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro guardado' });
        }
    }

    deleteGasto(g: GastoAlimentacion) {
        this.confirmationService.confirm({
            message: `¿Eliminar ${g.nombre}?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.gastos.set(this.gastos().filter((val) => val.id !== g.id));
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Registro borrado' });
            }
        });
    }

    hideDialog() { this.gastoDialog = false; }

    getSeverityStatus(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
        switch (status) {
            case 'Reservado': return 'success';
            case 'Pendiente': return 'warn';
            case 'Visto': return 'info';
            case 'Descartado': return 'danger';
            default: return 'secondary';
        }
    }

    getSeverityCategoria(cat: string) {
        switch (cat) {
            case 'Restaurante': return 'info';
            case 'Supermercado': return 'success';
            case 'Panadería': return 'secondary';
            case 'Calle / Snack': return 'warn';
            default: return 'secondary';
        }
    }
}