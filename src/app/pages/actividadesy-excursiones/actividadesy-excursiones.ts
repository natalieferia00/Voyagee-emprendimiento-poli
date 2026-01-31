import { Component, OnInit, signal, HostListener, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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

// Servicios (Asegúrate de tener este servicio creado para MongoDB)
import { ActivityService } from '../service/activity.service';

interface Tour {
    id?: string | number;
    _id?: string; // Para compatibilidad con MongoDB
    nombre?: string;
    destino?: string;
    duracion?: string;
    precio?: number;
    estado?: string;
    descripcion?: string;
    valoracion?: number;
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
    providers: [ConfirmationService, MessageService, CurrencyPipe, DatePipe],
    template: `
    <p-toast />
    <p-confirmdialog />

    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl text-800">Gestión de Actividades y Excursiones</div>
            <p-tag severity="contrast" [style]="{'font-size': '1.1rem', 'padding': '8px 15px'}" 
                   [value]="'Presupuesto Actividades: ' + (calcularTotal() | currency:'COP':'symbol':'1.0-0')" />
        </div>

        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nueva Actividad" icon="pi pi-plus" severity="success" (onClick)="openNew()" />
            </ng-template>
        </p-toolbar>

        <p-table #dt [value]="tours()" [rows]="10" [paginator]="true" [rowHover]="true" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>Actividad / Lugar</th>
                    <th>Fecha Planificada</th>
                    <th>Costo</th>
                    <th style="min-width: 12rem">Estado</th>
                    <th>Rating</th>
                    <th style="width: 8rem">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-tour>
                <tr>
                    <td>
                        <div class="font-bold text-800">{{ tour.nombre }}</div>
                        <div class="text-xs text-slate-500 italic">
                            <i class="pi pi-map-marker text-[10px]"></i> {{ tour.destino }}
                        </div>
                    </td>
                    <td>{{ tour.fecha | date: 'dd/MM/yyyy' }}</td>
                    <td class="font-semibold text-primary">
                        {{ tour.precio | currency:'COP':'symbol':'1.0-0' }}
                    </td>
                    <td>
                        <p-select 
                            [(ngModel)]="tour.estado" 
                            [options]="estados" 
                            optionLabel="label" 
                            optionValue="value"
                            (onChange)="onStatusChange(tour)"
                            styleClass="w-full border-none bg-transparent shadow-none"
                            appendTo="body">
                            <ng-template #selectedItem let-selectedOption>
                                <p-tag [value]="selectedOption.label" [severity]="getSeverityStatus(selectedOption.value)" />
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

        <p-dialog [(visible)]="tourDialog" [style]="{ width: '500px' }" header="Detalles de la Actividad" [modal]="true" styleClass="p-fluid">
            <div class="flex flex-col gap-4 pt-2">
                <div class="flex flex-col gap-2">
                    <label class="font-bold">Nombre del Tour / Actividad</label>
                    <input type="text" pInputText [(ngModel)]="tour.nombre" placeholder="Ej: Snorkeling en Barú" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-bold">Lugar / Destino</label>
                        <input type="text" pInputText [(ngModel)]="tour.destino" placeholder="Ciudad o punto" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-bold">Fecha</label>
                        <p-datepicker [(ngModel)]="tour.fecha" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="font-bold">Costo (COP)</label>
                        <p-inputnumber [(ngModel)]="tour.precio" mode="currency" currency="COP" locale="es-CO" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="font-bold">Prioridad / Interés</label>
                        <div class="pt-2"><p-rating [(ngModel)]="tour.valoracion" /></div>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="font-bold">Notas o Requerimientos</label>
                    <textarea pTextarea [(ngModel)]="tour.descripcion" rows="3" placeholder="Llevar protector solar..."></textarea>
                </div>
            </div>

            <ng-template #footer>
                <p-button label="Cancelar" [text]="true" severity="secondary" (onClick)="hideDialog()" />
                <p-button label="Guardar" icon="pi pi-check" severity="success" (onClick)="saveTour()" />
            </ng-template>
        </p-dialog>

        <p-dialog header="Asignar a Presupuesto" [(visible)]="destinosDialog" [modal]="true" [style]="{width: '400px'}">
            <div class="p-2">
                <p class="mb-4 text-sm">Esta actividad está <b>Reservada</b>. ¿A qué destino pertenece este gasto?</p>
                <p-select [options]="listaDestinos" [(ngModel)]="destinoSeleccionado" optionLabel="nombre" placeholder="Elegir Destino" styleClass="w-full" appendTo="body" />
                <div class="flex justify-end mt-4">
                    <p-button label="Sincronizar" icon="pi pi-sync" (onClick)="confirmarVinculacion()" [disabled]="!destinoSeleccionado" />
                </div>
            </div>
        </p-dialog>
    </div>
    `
})
export class ActividadesyExcursionesComponent implements OnInit {
    private activityService = inject(ActivityService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    tours = signal<Tour[]>([]);
    tour: Tour = {};
    tourDialog: boolean = false;
    destinosDialog: boolean = false;
    listaDestinos: any[] = [];
    destinoSeleccionado: any = null;
    tourPendiente: Tour | null = null;

    private readonly LS_CALC_KEY = 'mis_destinos_data_v2';

    estados = [
        { label: 'Visto', value: 'Visto' },
        { label: 'Reservado', value: 'Reservado' },
        { label: 'Pendiente', value: 'Pendiente' },
        { label: 'Descartado', value: 'Descartado' }
    ];

    ngOnInit() { this.loadData(); }

    loadData() {
        this.activityService.getActivities().subscribe({
            next: (data) => {
                this.tours.set(data.map(t => ({ 
                    ...t, 
                    id: t._id, 
                    fecha: t.fecha ? new Date(t.fecha) : null 
                })));
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con el servidor' })
        });
    }

    saveTour() {
        if (!this.tour.nombre?.trim()) return;

        const body = { ...this.tour, _id: this.tour.id };

        this.activityService.saveActivity(body).subscribe({
            next: (res) => {
                const tourGuardado = { ...this.tour, id: res._id };
                
                // Lógica de sincronización
                if (this.tour.estado === 'Reservado' && !this.tour.registradoEnCalculadora) {
                    this.abrirVinculacion(tourGuardado);
                } else if (this.tour.estado !== 'Reservado' && this.tour.registradoEnCalculadora) {
                    this.eliminarDeCalculadora(this.tour);
                }

                this.loadData();
                this.tourDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actividad actualizada' });
            }
        });
    }

    onStatusChange(t: Tour) {
        if (t.estado === 'Reservado' && !t.registradoEnCalculadora) {
            this.abrirVinculacion(t);
        } else if (t.estado !== 'Reservado' && t.registradoEnCalculadora) {
            this.eliminarDeCalculadora(t);
        }
        // Actualizar en BD el cambio de estado
        this.activityService.saveActivity({ ...t, _id: t.id }).subscribe();
    }

    abrirVinculacion(t: Tour) {
        const data = localStorage.getItem(this.LS_CALC_KEY);
        this.listaDestinos = data ? JSON.parse(data) : [];
        
        if (this.listaDestinos.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Calculadora Vacía', detail: 'Crea un destino primero' });
            t.estado = 'Visto';
            return;
        }
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
                refId: this.tourPendiente.id,
                categoria: 'Otros',
                descripcion: `Tour: ${this.tourPendiente.nombre}`,
                monto: this.tourPendiente.precio || 0
            });
            
            localStorage.setItem(this.LS_CALC_KEY, JSON.stringify(dataCalc));
            window.dispatchEvent(new Event('storage')); // Sincroniza widgets
            
            this.tourPendiente.registradoEnCalculadora = true;
            this.tourPendiente.refGastoId = gastoId;
            
            // Persistir bandera en BD
            this.activityService.saveActivity({ ...this.tourPendiente, _id: this.tourPendiente.id }).subscribe();
            this.messageService.add({ severity: 'success', summary: 'Sincronizado', detail: 'Añadido al presupuesto global' });
        }
        this.destinosDialog = false;
    }

    eliminarDeCalculadora(t: Tour) {
        const dataCalc = JSON.parse(localStorage.getItem(this.LS_CALC_KEY) || '[]');
        let cambio = false;

        dataCalc.forEach((dest: any) => {
            if (dest.gastos) {
                const count = dest.gastos.length;
                dest.gastos = dest.gastos.filter((g: any) => g.refId !== t.id && g.id !== t.refGastoId);
                if (dest.gastos.length !== count) cambio = true;
            }
        });

        if (cambio) {
            localStorage.setItem(this.LS_CALC_KEY, JSON.stringify(dataCalc));
            window.dispatchEvent(new Event('storage'));
        }
        t.registradoEnCalculadora = false;
        t.refGastoId = undefined;
    }

    deleteTour(t: Tour) {
        this.confirmationService.confirm({
            message: `¿Eliminar "${t.nombre}"? También se quitará del presupuesto.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-trash',
            accept: () => {
                this.activityService.deleteActivity(t.id!.toString()).subscribe(() => {
                    this.eliminarDeCalculadora(t);
                    this.loadData();
                    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Registro borrado' });
                });
            }
        });
    }

    calcularTotal() {
        return this.tours().reduce((acc, t) => acc + (t.precio || 0), 0);
    }

    openNew() {
        this.tour = { valoracion: 0, estado: 'Visto', precio: 0, fecha: new Date() };
        this.tourDialog = true;
    }

    editTour(t: Tour) {
        this.tour = { ...t };
        this.tourDialog = true;
    }

    hideDialog() { this.tourDialog = false; }

    getSeverityStatus(status: any): any {
        const map: any = { 'Reservado': 'success', 'Pendiente': 'warn', 'Visto': 'info', 'Descartado': 'danger' };
        return map[status] || 'secondary';
    }
}