import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { CardModule } from 'primeng/card';     
import { ButtonModule } from 'primeng/button';   


export interface IPerfilUsuario {
    nombreUsuario: string;
    correoUsuario: string;
    estadoActivo: boolean;
    fechaCreacion: string;
    ultimoIngreso: string;
    fechaInicioViaje: string;
    presupuestoTotal: string;
}

@Component({
  selector: 'app-perfil-usuario-card',
  standalone: true, 
  imports: [
    CommonModule,  
    CardModule,    
    ButtonModule   
  ],

  templateUrl: './perfil-usuario-card.html',
  styleUrls: ['./perfil-usuario-card.scss'] 
})
export class PerfilUsuarioCardComponent {

  public datosPerfil: IPerfilUsuario = {
    nombreUsuario: 'Natalia Fernández',
    correoUsuario: 'natalia.fdez@voyagee.com',
    estadoActivo: true,
    fechaCreacion: '01/01/2024',
    ultimoIngreso: '09/11/2025 10:30 a.m.',
    fechaInicioViaje: '20/12/2025',
    presupuestoTotal: 'COP 15.000.000'
  };
}