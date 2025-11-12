import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    AppConfigurator,
    DatePickerModule,
    FormsModule
  ],
  template: `
    <div class="layout-topbar">
      <div class="layout-topbar-logo-container">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
          <i class="pi pi-bars"></i>
        </button>
        <a class="layout-topbar-logo" routerLink="/">
          <span>Voyagee</span>
        </a>
      </div>

      <div class="layout-topbar-actions">
        <div class="layout-config-menu">
          <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
            <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
          </button>

          <div class="relative">
            <button
              class="layout-topbar-action layout-topbar-action-highlight"
              pStyleClass="@next"
              enterFromClass="hidden"
              enterActiveClass="animate-scalein"
              leaveToClass="hidden"
              leaveActiveClass="animate-fadeout"
              [hideOnOutsideClick]="true"
            >
              <i class="pi pi-palette"></i>
            </button>
            <app-configurator />
          </div>
        </div>

        <button
          class="layout-topbar-menu-button layout-topbar-action"
          pStyleClass="@next"
          enterFromClass="hidden"
          enterActiveClass="animate-scalein"
          leaveToClass="hidden"
          leaveActiveClass="animate-fadeout"
          [hideOnOutsideClick]="true"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu hidden lg:block">
          <div class="layout-topbar-menu-content">
            <div class="relative">
              <button type="button" class="layout-topbar-action" (click)="toggleCalendar()">
                <i class="pi pi-calendar"></i>
                <span>Calendario</span>
              </button>

              <div
                *ngIf="showCalendar"
                class="absolute right-0 mt-2 shadow-md  rounded-lg z-50 bg-white p-2"
              >
                <p-datepicker
                  [(ngModel)]="selectedDate"
                  [inline]="true"
                  [showButtonBar]="true"
                  [touchUI]="true"
                  dateFormat="dd/mm/yy"
                ></p-datepicker>
              </div>
            </div>

            <button type="button" class="layout-topbar-action">
              <i class="pi pi-inbox"></i>
              <span>Mensajes</span>
            </button>

            <button type="button" class="layout-topbar-action">
              <i class="pi pi-user"></i>
              <span>Perfil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppTopbar {
  items!: MenuItem[];
  showCalendar = false;
  selectedDate: Date = new Date(); 

  constructor(public layoutService: LayoutService) {}

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme
    }));
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }
}
