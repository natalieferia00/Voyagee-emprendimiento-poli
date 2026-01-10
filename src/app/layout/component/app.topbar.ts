import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StyleClassModule } from 'primeng/styleclass';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { PerfilUsuarioCardComponent } from '../component/perfil-usuario-card/perfil-usuario-card';
import { ConversorMonedaComponent } from '../component/conversor-moneda/conversor-moneda';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        FormsModule,
        StyleClassModule,
        DatePickerModule,
        InputNumberModule,
        DialogModule,
        AppConfigurator,
        PerfilUsuarioCardComponent,
        ConversorMonedaComponent 
    ],
    template: `
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>

            <a class="layout-topbar-logo" routerLink="/">
               
                <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" style="margin-right: 0.5rem;">
                    <circle cx="7" cy="7" r="6" fill="var(--primary-color)" />
                </svg>

                <span>Voyagee</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme()}"></i>
                </button>

                <div class="relative">
                    <button class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true">
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content flex flex-column gap-2">

                    <div class="relative">
                        <button type="button" class="layout-topbar-action w-full justify-content-start" (click)="toggleCalendar()">
                            <i class="pi pi-calendar mr-2"></i>
                            <span>Calendar</span>
                        </button>
                        <div *ngIf="mostrarCalendario" class="absolute right-0 mt-2 z-50 animate-fadein shadow-4 border-round overflow-hidden">
                            <p-datepicker [(ngModel)]="fechaSeleccionada" [inline]="true" [showOtherMonths]="false"></p-datepicker>
                        </div>
                    </div>

                    <div class="relative">
                        <button type="button" class="layout-topbar-action w-full justify-content-start" (click)="mostrarConversor = true">
                            <i class="pi pi-money-bill mr-2"></i>
                            <span>Currency</span>
                        </button>
                    </div>

                    <div class="relative">
                        <button type="button" class="layout-topbar-action w-full justify-content-start" (click)="togglePerfilCard()">
                            <i class="pi pi-user mr-2"></i>
                            <span>Profile</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <p-dialog 
        header="Conversor de Moneda" 
        [(visible)]="mostrarConversor" 
        [modal]="true" 
        [style]="{ width: '450px' }" 
        [draggable]="false" 
        [resizable]="false"
        [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">

        <app-conversor-moneda></app-conversor-moneda>

    </p-dialog>

    <div *ngIf="mostrarPerfilCard" class="fixed top-20 right-4 z-50 animate-fadein">
        <app-perfil-usuario-card></app-perfil-usuario-card>
    </div>
    `,
    styles: [`
        .animate-fadein {
            animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        :host ::ng-deep .p-datepicker-inline {
            border: none;
            background: var(--surface-card);
        }

        .layout-topbar-action.w-full {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            border-radius: 8px;
        }
    `]
})
export class AppTopbar {
    mostrarPerfilCard = false;
    mostrarCalendario = false;
    mostrarConversor = false;

    fechaSeleccionada: Date = new Date();

    constructor(public layoutService: LayoutService) {}

    toggleDarkMode() {
        this.layoutService.layoutConfig.update(state => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    togglePerfilCard() {
        this.mostrarPerfilCard = !this.mostrarPerfilCard;
        if (this.mostrarPerfilCard) {
            this.mostrarCalendario = false;
        }
    }

    toggleCalendar() {
        this.mostrarCalendario = !this.mostrarCalendario;
        if (this.mostrarCalendario) {
            this.mostrarPerfilCard = false;
        }
    }
}
