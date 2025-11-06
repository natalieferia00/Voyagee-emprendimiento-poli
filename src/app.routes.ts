import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { MapaRutaComponent } from '@/pages/maparuta/maparuta';
import { ListaViajeComponent } from '@/pages/lista-viaje/lista-viaje';
import { SegurosComponent } from '@/pages/seguros/seguros';
import { CalculadoraGastosComponent } from '@/pages/calculadoragastos/calculadoragastos';
import { Gestiondetransporte } from '@/pages/gestiondetransporte/gestiondetransporte';
import { GestionAlimentacionComponent } from '@/pages/gestionalimentacion/gestionalimentacion';
import { ActividadesyExcursionesComponent } from '@/pages/actividadesy-excursiones/actividadesy-excursiones';
import { PresupuestoComponent } from '@/pages/presupuesto/presupuesto';




export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'lista-viaje', component: ListaViajeComponent },
            { path: 'calculadora-gastos', component: CalculadoraGastosComponent },
            { path: 'mapa-ruta', component: MapaRutaComponent },
          { path: 'gestion-alimentacion', component: GestionAlimentacionComponent },
          { path: 'presupuesto', component: PresupuestoComponent},
          { path: 'actividades-y-excursiones', component: ActividadesyExcursionesComponent },
          { path: 'gestion-transporte', component: Gestiondetransporte },
            { path: 'seguros', component: SegurosComponent },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
