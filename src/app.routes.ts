import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';

import { MapaRutaComponent } from '@/pages/maparuta/maparuta';
import { ListaViajeComponent } from '@/pages/lista-viaje/lista-viaje';
import { DocumentationComponent } from '@/pages/seguros/seguros';
import { CalculadoraGastosComponent } from '@/pages/calculadoragastos/calculadoragastos';
import { Gestiondetransporte } from '@/pages/gestiondetransporte/gestiondetransporte';
import { GestionAlimentacionComponent } from '@/pages/gestionalimentacion/gestionalimentacion';
import { ActividadesyExcursionesComponent } from '@/pages/actividadesy-excursiones/actividadesy-excursiones';
import { PresupuestoComponent } from '@/pages/presupuesto/presupuesto';
import { CrearNotificacionComponent } from '@/pages/crear-notificaciones/crear-notificaciones';


export const appRoutes: Routes = [

       {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },

    {
        path: 'auth',
        loadChildren: () => import('./app/pages/auth/auth.routes')
    },

   
    {
        path: '',
        component: AppLayout,
    
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'lista-viaje', component: ListaViajeComponent },
            { path: 'calculadora-gastos', component: CalculadoraGastosComponent },
            { path: 'mapa-ruta', component: MapaRutaComponent },
            { path: 'gestion-alimentacion', component: GestionAlimentacionComponent },
            { path: 'presupuesto', component: PresupuestoComponent },
            { path: 'actividades-y-excursiones', component: ActividadesyExcursionesComponent },
            { path: 'crear-notificaciones', component: CrearNotificacionComponent },
            { path: 'gestion-transporte', component: Gestiondetransporte },
            { path: 'seguros', component: DocumentationComponent },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },


    { path: 'notfound', component: Notfound },


    { path: '**', redirectTo: 'auth/login' }
];
