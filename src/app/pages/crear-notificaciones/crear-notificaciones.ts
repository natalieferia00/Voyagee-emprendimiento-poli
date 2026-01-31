import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

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

import { NotificationService, Notification } from '../service/notification.service';

@Component({
  selector: 'app-crear-notificacion',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InputTextModule, DatePickerModule,
    ButtonModule, TableModule, TagModule, DividerModule, RippleModule,
    DialogModule, ToastModule, ConfirmDialogModule, MessageModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-semibold text-xl text-surface-900 dark:text-surface-0">Crear Notificaciones - Voyagee</h2>
        <button pButton label="Nueva Notificación" icon="pi pi-plus" 
                class="p-button-success" (click)="abrirDialog()"></button>
      </div>

      <p-divider></p-divider>

      <p-table [value]="notificaciones" [paginator]="true" [rows]="5" 
               [showGridlines]="true" [rowHover]="true" responsiveLayout="scroll">
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
            <td><p-tag [value]="noti.estado || 'Activa'" [severity]="getSeverity(noti.estado)"></p-tag></td>
            <td>
              <div class="flex gap-2">
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-text" 
                        (click)="editarNotificacion(noti)" pRipple></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" 
                        (click)="confirmarEliminacion(noti._id || noti.id)" pRipple></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="5" class="text-center p-4">No hay notificaciones activas.</td></tr>
        </ng-template>
      </p-table>

      <p-dialog [header]="editando ? 'Editar Notificación' : 'Agregar Notificación'" 
                [(visible)]="mostrarDialogo" [modal]="true" [style]="{ width: '450px' }" (onHide)="resetFormulario()">
        <div class="flex flex-col gap-4 mt-2">
          <div>
            <label class="block mb-1 text-sm font-medium">Fecha</label>
            <p-datepicker [(ngModel)]="nuevaNotificacion.fecha" showIcon appendTo="body" class="w-full"></p-datepicker>
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">Hora</label>
            <input pInputText type="time" [(ngModel)]="nuevaNotificacion.hora" class="w-full" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">Descripción</label>
            <input pInputText [(ngModel)]="nuevaNotificacion.descripcion" placeholder="Ej: Vuelo a Madrid" class="w-full" />
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button pButton label="Cancelar" class="p-button-text p-button-secondary" (click)="cerrarDialog()"></button>
          <button pButton label="Guardar" class="p-button-success" (click)="guardarNotificacion()"></button>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; padding: 1rem; }
    .card { background: var(--card-background); padding: 1.5rem; border-radius: 10px; }
  `]
})
export class CrearNotificacionComponent implements OnInit, OnDestroy {
  notificaciones: Notification[] = [];
  mostrarDialogo = false;
  editando = false;
  notificacionEditandoId: string | number | null = null;
  private sub?: Subscription;

  nuevaNotificacion: any = {
    fecha: new Date(),
    hora: '',
    descripcion: ''
  };

  constructor(
    private notiService: NotificationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    // Sincronización automática con los widgets [cite: 2026-01-10]
    this.sub = this.notiService.notifications$.subscribe(data => {
      this.notificaciones = data;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  abrirDialog() {
    this.resetFormulario();
    this.mostrarDialogo = true;
  }

  cerrarDialog() {
    this.mostrarDialogo = false;
  }

  resetFormulario() {
    this.nuevaNotificacion = { fecha: new Date(), hora: '', descripcion: '' };
    this.editando = false;
    this.notificacionEditandoId = null;
  }

  guardarNotificacion() {
    if (!this.nuevaNotificacion.descripcion || !this.nuevaNotificacion.hora) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Campos incompletos' });
      return;
    }

    if (this.editando && this.notificacionEditandoId) {
      this.notiService.update(this.notificacionEditandoId, this.nuevaNotificacion).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado' });
        this.cerrarDialog();
      });
    } else {
      this.notiService.add(this.nuevaNotificacion).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Creado' });
        this.cerrarDialog();
      });
    }
  }

  editarNotificacion(noti: Notification) {
    this.editando = true;
    this.notificacionEditandoId = noti._id || noti.id || null;
    this.nuevaNotificacion = { ...noti, fecha: new Date(noti.fecha) };
    this.mostrarDialogo = true;
  }

  confirmarEliminacion(id: any) {
    this.confirmationService.confirm({
      message: '¿Eliminar notificación?',
      accept: () => {
        this.notiService.delete(id).subscribe(() => {
          this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Registro borrado' });
        });
      }
    });
  }

  getSeverity(status: any): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const map: any = { 'Activa': 'success', 'Pendiente': 'warn', 'Expirada': 'danger' };
    return map[status] || 'info';
  }
}