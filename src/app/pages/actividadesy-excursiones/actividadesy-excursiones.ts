import { Component, OnInit, signal, HostListener, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';

interface Tour {
    id?: number;
    nombre?: string | null;
    destino?: string | null;
    duracion?: string | null;
    precio?: number | null;
    estado?: string | null;
    descripcion?: string | null;
    valoracion?: number | null;
    fecha?: Date | null;
    registradoEnCalculadora?: boolean;
    refGastoId?: number;
}

@Component({
    selector: 'app-actividadesy-excursiones',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, TagModule, RatingModule,
        InputTextModule, ButtonModule, ToolbarModule, DialogModule,
        SelectModule, InputNumberModule, TextareaModule, ConfirmDialogModule, 
        ToastModule, DatePickerModule, TooltipModule
    ],
    providers: [ConfirmationService, MessageService, CurrencyPipe],
    template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl">Gestión de Actividades y Excursiones</div>
            <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                   [value]="'Inversión Total: ' + (calcularTotal() | currency:'COP':'symbol':'1.0-0')" />
        </div>

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nueva Actividad" icon="pi pi-plus" severity="success" class="mr-2" (onClick)="openNew()" />
            </ng-template>
            <ng-template #end>
                <p-button label="Exportar" icon="pi pi-upload" severity="secondary" [outlined]="true" (onClick)="dt.exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="tours()" [rows]="10" [paginator]="true" [rowHover]="true" [showGridlines]="true">
            <ng-template #header>
                <tr>
                    <th>Actividad / Destino</th>
                    <th>Fecha</th>
                    <th>Costo Estimado</th>
                    <th style="min-width: 12rem">Estado (Cambio Rápido)</th>
                    <th>Valoración</th>
                    <th style="width: 8rem">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-tour>
                <tr>
                    <td>
                        <div class="font-bold text-800">{{ tour.nombre }}</div>
                        <div class="text-xs text-slate-500 italic">{{ tour.destino }}</div>
                    </td>
                    <td>{{ tour.fecha | date: 'dd/MM/yyyy' }}</td>
                    <td class="font-semibold text-primary">
                        {{ tour.precio | currency:'COP':'symbol':'1.0-0' }}
                    </td>
                    <td>
                        <p-select 
                            [(ngModel)]="tour.estado" 
                            [options]="estados" 
                            (onChange)="onStatusChange(tour)"
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
                    <td><p-rating [ngModel]="tour.valoracion" [readonly]="true" /></td>
                    <td>
                        <div class="flex gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" severity="info" (onClick)="editTour(tour)" />
                            <p-button icon="pi pi-trash" [rounded]="true" [outlined]="true" severity="danger" (onClick)="deleteTour(tour)" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="tourDialog" [style]="{ width: '550px' }" header="Detalles de la Actividad" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-5 pt-2">
                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-900">Nombre de la Actividad</label>
                        <input type="text" pInputText [(ngModel)]="tour.nombre" placeholder="Ej: Tour Islas del Rosario..." autofocus />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Destino</label>
                            <input type="text" pInputText [(ngModel)]="tour.destino" placeholder="Ciudad, Lugar..." />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Fecha</label>
                            <p-datepicker [(ngModel)]="tour.fecha" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Costo (COP)</label>
                            <p-inputnumber [(ngModel)]="tour.precio" mode="currency" currency="COP" locale="es-CO" placeholder="$ 0" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="font-bold text-900">Valoración</label>
                            <div class="pt-2">
                                <p-rating [(ngModel)]="tour.valoracion" />
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-900">Descripción / Notas</label>
                        <textarea pTextarea [(ngModel)]="tour.descripcion" rows="4" style="resize: none" placeholder="Horarios, puntos de encuentro..."></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                    <p-button label="Guardar Actividad" icon="pi pi-check" severity="success" (onClick)="saveTour()" />
                </div>
            </ng-template>
        </p-dialog>

        <p-dialog header="Vincular a Presupuesto" [(visible)]="destinosDialog" [modal]="true" [style]="{width: '400px'}">
            <div class="p-2">
                <p class="mb-4">¿A qué destino quieres asignar este gasto reservado?</p>
                <p-select [options]="listaDestinos" [(ngModel)]="destinoSeleccionado" optionLabel="nombre" placeholder="Seleccionar destino" styleClass="w-full" appendTo="body" />
                <div class="flex justify-end mt-4">
                    <p-button label="Confirmar" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado" />
                </div>
            </div>
        </p-dialog>
    </div>
    `
})
export class ActividadesyExcursionesComponent implements OnInit {
    tours = signal<Tour[]>([]);
    tour: Tour = {};
    tourDialog: boolean = false;
    destinosDialog: boolean = false;
    listaDestinos: any[] = [];
    destinoSeleccionado: any = null;
    tourPendiente: Tour | null = null;

    private readonly LS_KEY = 'mis_tours_data_v1';
    private readonly LS_CALC_KEY = 'mis_destinos_data_v2';

    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    estados = [
        { label: 'Visto', value: 'Visto' },
        { label: 'Reservado', value: 'Reservado' },
        { label: 'Pendiente', value: 'Pendiente' },
        { label: 'Descartado', value: 'Descartado' }
    ];

    @HostListener('window:storage')
    onExternalUpdate() { this.loadFromLocal(); }

    ngOnInit() { this.loadFromLocal(); }

    loadFromLocal() {
        const saved = localStorage.getItem(this.LS_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            this.tours.set(data.map((t: any) => ({ ...t, fecha: t.fecha ? new Date(t.fecha) : null })));
        }
    }

    saveToLocal() { localStorage.setItem(this.LS_KEY, JSON.stringify(this.tours())); }

    onStatusChange(t: Tour) {
        if (t.estado === 'Reservado' && !t.registradoEnCalculadora) {
            this.abrirVinculacion(t);
        } else if (t.estado !== 'Reservado' && t.registradoEnCalculadora) {
            this.eliminarDeCalculadora(t);
        }
        this.saveToLocal();
    }

    abrirVinculacion(t: Tour) {
        const data = localStorage.getItem(this.LS_CALC_KEY);
        this.listaDestinos = data ? JSON.parse(data) : [];
        if (this.listaDestinos.length === 0) return;
        this.tourPendiente = t;
        this.destinosDialog = true;
    }

    confirmarVinculacion() {
        if (!this.tourPendiente || !this.destinoSeleccionado) return;
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC_KEY) || '[]');
        const idx = dataCalc.findIndex((d: any) => d.id === this.destinoSeleccionado.id);
        
        if (idx !== -1) {
            const gastoId = Date.now();
            if (!dataCalc[idx].gastos) dataCalc[idx].gastos = [];
            dataCalc[idx].gastos.push({
                id: gastoId,
                categoria: 'Otros',
                descripcion: `Actividad: ${this.tourPendiente.nombre}`,
                monto: this.tourPendiente.precio || 0
            });
            localStorage.setItem(this.LS_CALC_KEY, JSON.stringify(dataCalc));
            window.dispatchEvent(new Event('storage'));
            
            this.tourPendiente.registradoEnCalculadora = true;
            this.tourPendiente.refGastoId = gastoId;
            this.saveToLocal();
            this.messageService.add({ severity: 'success', summary: 'Sincronizado', detail: 'Añadido al presupuesto' });
        }
        this.destinosDialog = false;
    }

    eliminarDeCalculadora(t: Tour) {
        if (!t.refGastoId) return;
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC_KEY) || '[]');
        dataCalc.forEach((dest: any) => {
            if (dest.gastos) dest.gastos = dest.gastos.filter((g: any) => g.id !== t.refGastoId);
        });
        localStorage.setItem(this.LS_CALC_KEY, JSON.stringify(dataCalc));
        window.dispatchEvent(new Event('storage'));
        t.registradoEnCalculadora = false;
        t.refGastoId = undefined;
    }

    calcularTotal() { return this.tours().reduce((acc, t) => acc + (t.precio || 0), 0); }
    openNew() { this.tour = { valoracion: 0, estado: 'Visto', precio: 0, fecha: new Date() }; this.tourDialog = true; }
    editTour(t: Tour) { this.tour = { ...t }; this.tourDialog = true; }
    hideDialog() { this.tourDialog = false; }

    saveTour() {
        if (this.tour.nombre?.trim()) {
            let _tours = [...this.tours()];
            if (this.tour.id) {
                const index = _tours.findIndex(r => r.id === this.tour.id);
                _tours[index] = this.tour;
            } else {
                this.tour.id = Math.floor(Math.random() * 100000);
                _tours.push(this.tour);
            }
            this.tours.set(_tours);
            this.saveToLocal();
            this.tourDialog = false;
            if (this.tour.estado === 'Reservado') this.onStatusChange(this.tour);
        }
    }

    deleteTour(t: Tour) {
        this.confirmationService.confirm({
            message: `¿Eliminar la actividad ${t.nombre}?`,
            accept: () => {
                this.eliminarDeCalculadora(t);
                this.tours.set(this.tours().filter((val) => val.id !== t.id));
                this.saveToLocal();
            }
        });
    }

    getSeverityStatus(status: any): any {
        const map: any = { 'Reservado': 'success', 'Pendiente': 'warn', 'Visto': 'info', 'Descartado': 'danger' };
        return map[status] || 'secondary';
    }
}