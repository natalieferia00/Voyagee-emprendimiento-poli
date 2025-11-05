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
import { GestionAlimentacionComponent } from '@/pages/gestionalimentacion/gestionalimentacion';




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
