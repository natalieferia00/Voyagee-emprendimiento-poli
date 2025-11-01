import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    TimelineModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule
  ],
  template: `
    <div class="bg-surface-0 dark:bg-surface-900 p-6 min-h-screen">
      <h1 class="text-3xl font-bold text-center mb-10 text-blue-700">
        Itinerario de Viaje
      </h1>

      <div class="grid grid-cols-12 gap-8">
        <!-- 🧭 Vuelos -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <div class="card shadow-lg rounded-2xl p-4">
            <div class="flex justify-between items-center mb-4">
              <span class="font-semibold text-xl text-blue-600">Vuelos programados</span>
              <button pButton icon="pi pi-plus" class="p-button-rounded p-button-text text-blue-600 hover:text-blue-800"
                (click)="showForm()"></button>
            </div>
            <p-timeline [value]="vuelos" align="alternate">
              <ng-template #marker let-event>
                <span class="flex w-8 h-8 items-center justify-center text-white rounded-full shadow"
                      [style]="{ 'background-color': event.color }">
                  <i [class]="event.icon"></i>
                </span>
              </ng-template>
              <ng-template #content let-event>
                <p-card [header]="event.destino" [subheader]="event.fecha">
                  <p class="text-sm text-gray-700">{{ event.descripcion }}</p>
                </p-card>
              </ng-template>
            </p-timeline>
          </div>
        </div>

        <!-- 🧳 Estado del viaje -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">
          <div class="card shadow-lg rounded-2xl p-4">
            <div class="font-semibold text-xl mb-4 text-purple-600">Estado del viaje</div>
            <p-timeline [value]="estadoViaje" align="alternate">
              <ng-template #marker let-event>
                <span class="flex w-8 h-8 items-center justify-center text-white rounded-full shadow"
                      [style]="{ 'background-color': event.color }">
                  <i [class]="event.icon"></i>
                </span>
              </ng-template>
              <ng-template #content let-event>
                <p-card [header]="event.estado" [subheader]="event.fecha">
                  <p class="text-sm text-gray-700">{{ event.descripcion }}</p>
                </p-card>
              </ng-template>
            </p-timeline>
          </div>
        </div>

        <!-- 🌍 Destinos -->
        <div class="col-span-12 lg:col-span-4">
          <div class="card shadow-lg rounded-2xl p-4">
            <div class="font-semibold text-xl mb-4 text-green-600">Destinos del itinerario</div>
            <p-timeline [value]="destinos" align="alternate">
              <ng-template #marker let-event>
                <span class="flex w-8 h-8 items-center justify-center text-white rounded-full shadow"
                      [style]="{ 'background-color': event.color }">
                  <i [class]="event.icon"></i>
                </span>
              </ng-template>
              <ng-template #content let-event>
                <p-card [header]="event.lugar" [subheader]="event.fecha">
                  <p class="text-sm text-gray-700">{{ event.descripcion }}</p>
                </p-card>
              </ng-template>
            </p-timeline>
          </div>
        </div>
      </div>

      <!-- 🏨 Diálogo del formulario -->
      <p-dialog header="Agregar información del viaje" [(visible)]="visible" [modal]="true" [style]="{width: '30rem'}" [closable]="true">
        <form (ngSubmit)="addInfo()" class="flex flex-col gap-4 p-2">
          <div>
            <label class="block font-medium mb-2 text-gray-700">Tipo de información</label>
            <input type="text" pInputText [(ngModel)]="nuevo.tipo" name="tipo"
              class="input-green" placeholder="Alojamiento, restaurante, sitio..." required />
          </div>

          <div>
            <label class="block font-medium mb-2 text-gray-700">Nombre o lugar</label>
            <input type="text" pInputText [(ngModel)]="nuevo.nombre" name="nombre"
              class="input-green" placeholder="Ej. Hotel París" required />
          </div>

          <div>
            <label class="block font-medium mb-2 text-gray-700">Descripción</label>
            <textarea [(ngModel)]="nuevo.descripcion" name="descripcion"
              class="input-green w-full border rounded p-2 focus:outline-none" rows="3"
              placeholder="Breve descripción del sitio" required></textarea>
          </div>

          <button pButton label="Guardar" icon="pi pi-check" class="w-full p-button-success"></button>
        </form>
      </p-dialog>
    </div>
  `,
  styles: [`
    /* 🌿 Estilo verde suave al enfocar */
    .input-green:focus,
    textarea.input-green:focus {
      border-color: #4CAF50 !important;
      box-shadow: 0 0 6px #A5D6A7 !important;
      transition: all 0.3s ease-in-out;
    }
  `]
})
export class Landing {
  visible = false;

  vuelos = [
    {
      destino: 'Bogotá - Madrid',
      fecha: '12/11/2025 08:00 AM',
      descripcion: 'Vuelo internacional con escala en Lisboa.',
      icon: 'pi pi-plane',
      color: '#2196F3'
    },
    {
      destino: 'Madrid - París',
      fecha: '14/11/2025 02:00 PM',
      descripcion: 'Conexión corta de 2 horas. Llegada a Charles de Gaulle.',
      icon: 'pi pi-send',
      color: '#9C27B0'
    },
    {
      destino: 'París - Bogotá',
      fecha: '22/11/2025 09:00 PM',
      descripcion: 'Vuelo de regreso con Air France.',
      icon: 'pi pi-home',
      color: '#4CAF50'
    }
  ];

  estadoViaje = [
    { estado: 'Reservado', fecha: '05/11/2025', descripcion: 'Boletos y hoteles confirmados.', icon: 'pi pi-check-circle', color: '#4CAF50' },
    { estado: 'En proceso', fecha: '10/11/2025', descripcion: 'Preparando equipaje y documentos.', icon: 'pi pi-cog', color: '#FFC107' },
    { estado: 'Descartado', fecha: '09/11/2025', descripcion: 'El vuelo a Roma fue cancelado.', icon: 'pi pi-times-circle', color: '#F44336' }
  ];

  destinos = [
    { lugar: 'Madrid 🇪🇸', fecha: '12/11/2025 - 14/11/2025', descripcion: 'Paseo por la Gran Vía y el Museo del Prado.', icon: 'pi pi-map-marker', color: '#3F51B5' },
    { lugar: 'París 🇫🇷', fecha: '14/11/2025 - 22/11/2025', descripcion: 'Visita a la Torre Eiffel y el Louvre.', icon: 'pi pi-map-marker', color: '#E91E63' }
  ];

  nuevo = { tipo: '', nombre: '', descripcion: '' };

  showForm() {
    this.visible = true;
  }

  addInfo() {
    console.log('Nueva información:', this.nuevo);
    this.nuevo = { tipo: '', nombre: '', descripcion: '' };
    this.visible = false;
  }
}
