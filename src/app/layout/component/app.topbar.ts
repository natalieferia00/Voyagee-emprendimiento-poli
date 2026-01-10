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
                <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467Z"
                        fill="var(--primary-color)"
                    />
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
                    <button class="layout-topbar-action layout-topbar-action-highlight" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
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
        .animate-fadein { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        :host ::ng-deep .p-datepicker-inline { border: none; background: var(--surface-card); }
        
        /* Ajuste para que los botones verticales se vean bien */
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
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
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