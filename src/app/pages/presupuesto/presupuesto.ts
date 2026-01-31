import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../service/user.service';

// IMPORTACIONES DE PRIMENG (Necesarias para corregir los errores 'is not a known element')
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select'; // O DropdownModule dependiendo de tu versión de PrimeNG
import { DatePickerModule } from 'primeng/datepicker'; // O CalendarModule en versiones anteriores
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    DatePickerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './presupuesto.html'
})
export class PresupuestoComponent implements OnInit {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Variables que faltaban en tu error de consola
  usuario: any = {
    nombre: '',
    email: '',
    moneda: 'USD',
    presupuestoTotal: 0,
    fechaViaje: null
  };

  monedas = [
    { label: 'Dólar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'Peso (MXN)', value: 'MXN' }
  ];

  passwords = {
    new: '',
    confirm: ''
  };

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    this.userService.getProfile().subscribe({
      next: (res: any) => {
        this.usuario = res;
      },
      error: () => console.error("Error al cargar perfil")
    });
  }

  guardarPerfil() {
    this.userService.updateProfile(this.usuario).subscribe({
      next: (res: any) => {
        // --- SINCRONIZACIÓN CON WIDGETS ---
        localStorage.setItem('user_profile', JSON.stringify(res));
        localStorage.setItem('backup_budget', res.presupuestoTotal.toString());
        window.dispatchEvent(new Event('storage'));
        // ----------------------------------
        
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado y widgets sincronizados' });
      }
    });
  }

  cambiarPassword() {
    if (this.passwords.new !== this.passwords.confirm) {
      this.messageService.add({ severity: 'error', detail: 'Las contraseñas no coinciden' });
      return;
    }
    // Lógica para llamar al servicio de cambio de password
  }

  confirmarEliminacion() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar tu cuenta?',
      accept: () => {
        // Lógica de eliminación
      }
    });
  }
}