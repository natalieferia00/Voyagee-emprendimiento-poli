import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        AppMenuitem
    ],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li
                    app-menuitem
                    *ngIf="!item.separator"
                    [item]="item"
                    [index]="i"
                    [root]="true">
                </li>

                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class AppMenu implements OnInit {

    model: MenuItem[] = [];

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.model = [

          
            {
                label: 'Principal',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/dashboard']
                    },
                    {
                        label: 'Mapa de Ruta',
                        icon: 'pi pi-fw pi-map-marker',
                        routerLink: ['/mapa-ruta']
                    }
                ]
            },

            
            {
                label: 'Planificación Financiera',
                items: [
                    {
                        label: 'Presupuesto General',
                        icon: 'pi pi-fw pi-money-bill',
                        routerLink: ['/presupuesto'],
                        items: [
                            {
                                label: 'Vuelos',
                                icon: 'pi pi-fw pi-send',
                                routerLink: ['/pages/empty']
                            },
                            {
                                label: 'Alojamientos',
                                icon: 'pi pi-fw pi-building',
                                routerLink: ['/pages/crud']
                            },
                            {
                                label: 'Transporte',
                                icon: 'pi pi-fw pi-car',
                                routerLink: ['/gestion-transporte']
                            },
                            {
                                label: 'Alimentación',
                                icon: 'pi pi-shopping-cart',
                                routerLink: ['/gestion-alimentacion']
                            },
                            {
                                label: 'Actividades y Excursiones',
                                icon: 'pi pi-fw pi-sun',
                                routerLink: ['/actividades-y-excursiones']
                            },
                            {
                                label: 'Documentos',
                                icon: 'pi pi-fw pi-file',
                                routerLink: ['/seguros']
                            },
                            {
                                label: 'Presupuesto',
                                icon: 'pi pi-fw pi-calculator',
                                routerLink: ['/calculadora-gastos']
                            }
                        ]
                    }
                ]
            },

         
            {
                label: 'Utilidades',
                items: [
                    {
                        label: 'Lista de Viaje',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/lista-viaje']
                    },
                    {
                        label: 'Notificaciones',
                        icon: 'pi pi-fw pi-bell',
                        routerLink: ['/crear-notificaciones']
                    },
                    {
                        label: 'Configuración',              
                        icon: 'pi pi-fw pi-cog',             
                        routerLink: ['/presupuesto']         
                    }
                ]
            },

         
            {
                label: 'Sesión',
                items: [
                    {
                        label: 'Cerrar sesión',
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => this.logout()
                    }
                ]
            }
        ];
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.router.navigate(['/auth/login']);
    }
}
