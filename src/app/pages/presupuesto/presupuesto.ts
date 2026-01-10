import { Component, OnInit, inject } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* PrimeNG */
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-presupuesto', // Mantenemos el selector original
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule,
    ToastModule, ConfirmDialogModule, SelectModule, DatePickerModule,
    DividerModule, PasswordModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="p-5 max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold mb-4 text-slate-800">Configuración de la Cuenta</h2>
      
      <div class="grid gap-6">
        
        <p-card header="Perfil" subheader="Actualiza tu información básica" styleClass="shadow-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-bold">Nombre Completo</label>
              <input pInputText [(ngModel)]="usuario.nombre" placeholder="Tu nombre" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-bold">Correo Electrónico</label>
              <input pInputText [(ngModel)]="usuario.email" placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div class="mt-4">
            <p-button label="Guardar Cambios" icon="pi pi-check" severity="success" (onClick)="guardarPerfil()" />
          </div>
        </p-card>

        <p-card header="Preferencias de Viaje" styleClass="shadow-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-bold">Tipo de Moneda</label>
              <p-select [options]="monedas" [(ngModel)]="usuario.moneda" optionLabel="label" optionValue="value" class="w-full"></p-select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-bold">Próximo Viaje</label>
              <p-datepicker [(ngModel)]="usuario.fechaViaje" [showIcon]="true" placeholder="Selecciona fecha"></p-datepicker>
            </div>
          </div>
          <div class="mt-4">
            <p-button label="Actualizar Preferencias" icon="pi pi-refresh" (onClick)="guardarPerfil()" />
          </div>
        </p-card>

        <p-card header="Seguridad" styleClass="shadow-2">
          <div class="flex flex-col gap-4 max-w-md">
            <div class="flex flex-col gap-2">
              <label class="font-bold">Nueva Contraseña</label>
              <p-password [(ngModel)]="passwords.new" [toggleMask]="true" feedback="false" placeholder="********"></p-password>
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-bold">Confirmar Contraseña</label>
              <p-password [(ngModel)]="passwords.confirm" [toggleMask]="true" [feedback]="false" placeholder="********"></p-password>
            </div>
            <div>
              <p-button label="Cambiar Contraseña" icon="pi pi-lock" severity="warn" (onClick)="cambiarPassword()" />
            </div>
          </div>
        </p-card>

        <p-card header="Zona Peligrosa" styleClass="shadow-1 border-red-200 bg-red-50">
          <div class="flex justify-between items-center">
            <div>
              <h5 class="m-0 text-red-700 font-bold">Eliminar Cuenta</h5>
              <p class="text-red-600 text-sm m-0">Esta acción es irreversible y borrará todos tus datos de viaje.</p>
            </div>
            <p-button label="Eliminar" icon="pi pi-trash" severity="danger" (onClick)="confirmarEliminacion()" />
          </div>
        </p-card>

      </div>
    </div>
  `
})
export class PresupuestoComponent implements OnInit {
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Modelo de usuario
  usuario = {
    nombre: '',
    email: '',
    moneda: 'USD',
    fechaViaje: null as Date | null
  };

  // Para el cambio de pass
  passwords = {
    new: '',
    confirm: ''
  };

  monedas = [
    { label: 'Dólar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'Peso Mexicano (MXN)', value: 'MXN' },
    { label: 'Peso Colombiano (COP)', value: 'COP' }
  ];

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const data = localStorage.getItem('user_profile');
    if (data) {
      const parsed = JSON.parse(data);
      this.usuario = {
        ...parsed,
        fechaViaje: parsed.fechaViaje ? new Date(parsed.fechaViaje) : null
      };
    }
  }

  guardarPerfil() {
    localStorage.setItem('user_profile', JSON.stringify(this.usuario));
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Información actualizada correctamente' });
  }

  cambiarPassword() {
    if (!this.passwords.new || this.passwords.new !== this.passwords.confirm) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Las contraseñas no coinciden' });
      return;
    }
    // Lógica para guardar pass...
    this.messageService.add({ severity: 'success', summary: 'Seguridad', detail: 'Contraseña cambiada con éxito' });
    this.passwords = { new: '', confirm: '' };
  }

  confirmarEliminacion() {
    this.confirmationService.confirm({
      message: '¿Estás completamente seguro de eliminar tu cuenta? Todos los datos se perderán.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar todo',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        localStorage.clear();
        this.messageService.add({ severity: 'info', summary: 'Cuenta Eliminada', detail: 'Tus datos han sido borrados' });
        // Aquí podrías redirigir al Login
      }
    });
  }
}