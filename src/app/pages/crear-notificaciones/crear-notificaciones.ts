import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { MessageService, ConfirmationService } from 'primeng/api';

interface Notification {
    id: number;
    fecha: Date;
    hora: string;
    descripcion: string;
    estado: 'Activa' | 'Pendiente' | 'Expirada';
}

@Component({
    selector: 'app-crear-notificacion',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        DatePickerModule,
        ButtonModule,
        TableModule,
        TagModule,
        DividerModule,
        RippleModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        MessageModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <h2 class="font-semibold text-xl">Crear Notificaciones</h2>
                <button
                    pButton
                    label="Nueva Notificación"
                    icon="pi pi-plus"
                    class="p-button-success"
                    (click)="abrirDialog()"
                ></button>
            </div>

            <p-divider></p-divider>

            <p-table
                [value]="notificaciones"
                dataKey="id"
                [paginator]="true"
                [rows]="5"
                [showGridlines]="true"
                [rowHover]="true"
                responsiveLayout="scroll"
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-noti>
                    <tr>
                        <td>{{ noti.fecha | date: 'dd/MM/yyyy' }}</td>
                        <td>{{ noti.hora }}</td>
                        <td>{{ noti.descripcion }}</td>
                        <td>
                            <p-tag [value]="noti.estado" [severity]="getSeverity(noti.estado)"></p-tag>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <button
                                    pButton
                                    icon="pi pi-pencil"
                                    class="p-button-rounded p-button-info p-button-text"
                                    (click)="editarNotificacion(noti)"
                                    pRipple
                                ></button>
                                <button
                                    pButton
                                    icon="pi pi-trash"
                                    class="p-button-rounded p-button-danger p-button-text"
                                    (click)="confirmarEliminacion(noti.id)"
                                    pRipple
                                ></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5">
                            <div class="empty-state">
                                <i class="pi pi-bell-slash empty-icon"></i>
                                <p class="empty-text">No hay notificaciones</p>
                                <p class="empty-subtext">Haz clic en <strong>“Nueva Notificación”</strong> para crear la primera.</p>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <p-dialog
                [header]="editando ? 'Editar Notificación' : 'Agregar Notificación'"
                [(visible)]="mostrarDialogo"
                [modal]="true"
                [style]="{ width: '600px' }"
                [draggable]="false"
                [resizable]="false"
                (onHide)="resetFormulario()"
            >
                <div class="grid form-grid">
                    <div class="col">
                        <label for="fecha" class="block mb-1 text-sm text-gray-600">Fecha</label>
                        <p-datepicker
                            [(ngModel)]="nuevaNotificacion.fecha"
                            name="fecha"
                            inputId="fecha"
                            showIcon
                            appendTo="body"
                            [readonlyInput]="true"
                            inputStyleClass="w-full"
                            [ngClass]="{ 'ng-invalid': submitted && !nuevaNotificacion.fecha }"
                        ></p-datepicker>
                        <p-message *ngIf="submitted && !nuevaNotificacion.fecha" severity="error" text="La fecha es obligatoria."></p-message>
                    </div>

                    <div class="col">
                        <label for="hora" class="block mb-1 text-sm text-gray-600">Hora</label>
                        <input
                            pInputText
                            type="time"
                            id="hora"
                            name="hora"
                            [(ngModel)]="nuevaNotificacion.hora"
                            class="w-full"
                            [ngClass]="{ 'ng-invalid': submitted && !nuevaNotificacion.hora }"
                        />
                        <p-message *ngIf="submitted && !nuevaNotificacion.hora" severity="error" text="La hora es obligatoria."></p-message>
                    </div>

                    <div class="col">
                        <label for="descripcion" class="block mb-1 text-sm text-gray-600">Descripción</label>
                        <input
                            pInputText
                            type="text"
                            id="descripcion"
                            name="descripcion"
                            [(ngModel)]="nuevaNotificacion.descripcion"
                            placeholder="Ej: Reunión con el equipo"
                            class="w-full"
                            [ngClass]="{ 'ng-invalid': submitted && !nuevaNotificacion.descripcion.trim() }"
                        />
                        <p-message *ngIf="submitted && !nuevaNotificacion.descripcion.trim()" severity="error" text="La descripción es obligatoria."></p-message>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-3">
                    <button pButton label="Cancelar" icon="pi pi-times" class="p-button-secondary" (click)="cerrarDialog()"></button>
                    <button pButton label="Guardar" icon="pi pi-check" class="p-button-success" (click)="guardarNotificacion()"></button>
                </div>
            </p-dialog>
        </div>
    `,
    styles: [`
        :host { display: block; padding: 1rem; }
        .card { background: #fff; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .empty-state { text-align: center; padding: 3rem 0; color: #6b7280; }
        .empty-icon { font-size: 4rem; color: #9ca3af; display: block; margin-bottom: 0.75rem; }
        .empty-text { font-size: 1.4rem; font-weight: 600; color: #4b5563; }
        .empty-subtext { font-size: 1rem; color: #9ca3af; }
        .ng-invalid { border: 1px solid #ef4444 !important; }
    `]
})
export class CrearNotificacionComponent implements OnInit {
    notificaciones: Notification[] = [];
    mostrarDialogo = false;
    editando = false;
    submitted = false;
    notificacionEditandoId: number | null = null;
    
    // Clave para el localStorage
    private readonly LS_KEY = 'app_notificaciones_v1';

    nuevaNotificacion: Omit<Notification, 'id' | 'estado'> = {
        fecha: new Date(),
        hora: '',
        descripcion: ''
    };

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        // Cargar datos al iniciar
        const savedData = localStorage.getItem(this.LS_KEY);
        if (savedData) {
            this.notificaciones = JSON.parse(savedData);
        }
    }

    private saveToLocalStorage() {
        localStorage.setItem(this.LS_KEY, JSON.stringify(this.notificaciones));
        // Disparar evento para que el widget se actualice en tiempo real
        window.dispatchEvent(new Event('storage'));
    }

    abrirDialog(): void {
        this.editando = false;
        this.submitted = false;
        this.mostrarDialogo = true;
    }

    cerrarDialog(): void {
        this.mostrarDialogo = false;
    }

    resetFormulario(): void {
        this.nuevaNotificacion = { fecha: new Date(), hora: '', descripcion: '' };
        this.editando = false;
        this.submitted = false;
        this.notificacionEditandoId = null;
    }

    guardarNotificacion(): void {
        this.submitted = true;
        const { fecha, hora, descripcion } = this.nuevaNotificacion;
        
        if (!(fecha && hora && descripcion.trim())) return;

        if (this.editando && this.notificacionEditandoId) {
            this.notificaciones = this.notificaciones.map(n =>
                n.id === this.notificacionEditandoId ? { ...n, fecha, hora, descripcion } : n
            );
            this.messageService.add({ severity: 'success', summary: 'Actualizada', detail: 'La notificación fue actualizada.' });
        } else {
            const nueva: Notification = {
                id: Date.now(),
                fecha,
                hora,
                descripcion: descripcion.trim(),
                estado: 'Pendiente'
            };
            this.notificaciones = [...this.notificaciones, nueva];
            this.messageService.add({ severity: 'success', summary: 'Creada', detail: 'La notificación fue registrada.' });
        }

        this.saveToLocalStorage(); // GUARDAR
        this.resetFormulario();
        this.cerrarDialog();
    }

    editarNotificacion(noti: Notification): void {
        this.editando = true;
        this.notificacionEditandoId = noti.id;
        this.nuevaNotificacion = {
            fecha: new Date(noti.fecha),
            hora: noti.hora,
            descripcion: noti.descripcion
        };
        this.mostrarDialogo = true;
    }

    confirmarEliminacion(id: number): void {
        this.confirmationService.confirm({
            message: '¿Deseas eliminar esta notificación?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.eliminarNotificacion(id)
        });
    }

    eliminarNotificacion(id: number): void {
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
        this.saveToLocalStorage(); // GUARDAR TRAS ELIMINAR
        this.messageService.add({ severity: 'info', summary: 'Eliminada', detail: 'Notificación eliminada.' });
    }

    getSeverity(status: Notification['estado']): 'success' | 'warn' | 'danger' {
        switch (status) {
            case 'Activa': return 'success';
            case 'Pendiente': return 'warn';
            case 'Expirada': return 'danger';
        }
    }
}