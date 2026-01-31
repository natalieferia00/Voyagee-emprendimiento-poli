import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

export interface IPerfilUsuario {
    nombreUsuario: string;
    correoUsuario: string;
    estadoActivo: boolean;
    fechaCreacion: string;
    ultimoIngreso: string;
    fechaInicioViaje: string;
    presupuestoTotal: number;
    moneda: string;
    destinoPrincipal: string;
}

@Component({
    selector: 'app-perfil-usuario-card',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule],
    providers: [CurrencyPipe],
    templateUrl: './perfil-usuario-card.html',
    styleUrls: ['./perfil-usuario-card.scss']
})
export class PerfilUsuarioCardComponent implements OnInit {
    private router = inject(Router);

    public datosPerfil: IPerfilUsuario | null = null;
    public tieneInformacion: boolean = false;

    // Fechas automáticas fijas sincronizadas con tus instrucciones
    public readonly FECHA_CREACION = '10/01/2026';
    public readonly ULTIMO_INGRESO = new Date().toLocaleString();

    @HostListener('window:storage')
    onStorageChange() {
        this.cargarInformacionConsolidada();
    }

    ngOnInit() {
        this.cargarInformacionConsolidada();
    }

    cargarInformacionConsolidada() {
        // 1. Obtener todas las fuentes de datos posibles
        const profileData = localStorage.getItem('user_profile');
        const loginData = localStorage.getItem('currentUser'); // <-- El correo del registro
        const presupuestoGlobalRaw = localStorage.getItem('mi_presupuesto_global');
        const destinosData = localStorage.getItem('mis_destinos_data_v2');

        // Parseo seguro de objetos
        const profile = profileData ? JSON.parse(profileData) : null;
        const login = loginData ? JSON.parse(loginData) : null;
        const destinos = destinosData ? JSON.parse(destinosData) : [];
        const presupuestoCalculado = presupuestoGlobalRaw ? JSON.parse(presupuestoGlobalRaw) : 0;

        // Si no hay perfil NI datos de login, el usuario no está autenticado
        if (!profile && !login) {
            this.tieneInformacion = false;
            return;
        }

        // 2. Lógica de Destino Principal (se mantiene igual)
        let destinoMasCaro = 'Sin destinos';
        if (destinos.length > 0) {
            const topDestino = destinos.reduce((prev: any, current: any) => {
                const suma = (d: any) => (d.gastos || []).reduce((acc: number, g: any) => acc + (g.monto || 0), 0);
                return (suma(prev) > suma(current)) ? prev : current;
            });
            destinoMasCaro = topDestino.nombre || 'Sin nombre';
        }

        // 3. CONSOLIDACIÓN: Aquí es donde evitamos que el correo quede vacío
        this.datosPerfil = {
            // Si no hay nombre en perfil, usamos 'Viajero de Voyagee'
            nombreUsuario: profile?.nombre || 'Viajero de Voyagee',
            
            // Prioridad: 1. Perfil completo, 2. Correo de sesión activa, 3. 'Sin correo'
            correoUsuario: profile?.email || login?.email || 'Correo no disponible',
            
            estadoActivo: true,
            fechaCreacion: this.FECHA_CREACION,
            ultimoIngreso: this.ULTIMO_INGRESO,
            
            // Si no hay fecha de viaje, mostramos 'Configurar en perfil'
            fechaInicioViaje: profile?.fechaViaje 
                ? new Date(profile.fechaViaje).toLocaleDateString() 
                : 'Configurar en perfil',
            
            presupuestoTotal: presupuestoCalculado,
            moneda: profile?.moneda || 'USD',
            destinoPrincipal: destinoMasCaro
        };

        this.tieneInformacion = true;
    }

    irAConfiguracion() {
        this.router.navigate(['/presupuesto']);
    }
}