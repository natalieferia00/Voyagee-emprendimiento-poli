import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule, ButtonModule, CheckboxModule, InputTextModule, 
        PasswordModule, FormsModule, RouterModule, RippleModule, 
        AppFloatingConfigurator, ToastModule
    ],
    providers: [MessageService],
    template: `
        <p-toast />
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-8 w-16 shrink-0 mx-auto">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194..." fill="var(--primary-color)"/>
                            </svg>
                            
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                                {{ isRegisterMode ? 'Crea tu cuenta' : '¡Bienvenido a Voyagee!' }}
                            </div>
                            <span class="text-muted-color font-medium">
                                {{ isRegisterMode ? 'Regístrate para comenzar' : 'Inicia sesión para continuar' }}
                            </span>
                        </div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="isRegisterMode"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                                <span (click)="toggleMode()" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">
                                    {{ isRegisterMode ? '¿Ya tienes cuenta? Login' : '¿No tienes cuenta? Regístrate' }}
                                </span>
                            </div>
                            
                            <p-button 
                                [label]="isRegisterMode ? 'Registrarse' : 'Sign In'" 
                                styleClass="w-full" 
                                (onClick)="handleAuth()">
                            </p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';
    password: string = '';
    checked: boolean = false;
    isRegisterMode: boolean = false;

    private router = inject(Router);
    private messageService = inject(MessageService);

    // Clave para guardar los usuarios en LocalStorage
    private readonly USERS_KEY = 'voyagee_users';

    toggleMode() {
        this.isRegisterMode = !this.isRegisterMode;
        this.email = '';
        this.password = '';
    }

    handleAuth() {
        if (!this.email || !this.password) {
            this.showError('Por favor, completa todos los campos');
            return;
        }

        if (this.isRegisterMode) {
            this.register();
        } else {
            this.login();
        }
    }

    private register() {
        const users = this.getUsers();
        
        // Verificar si el usuario ya existe
        if (users.find(u => u.email === this.email)) {
            this.showError('El correo ya está registrado');
            return;
        }

        // Guardar nuevo usuario
        users.push({ email: this.email, password: this.password });
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cuenta creada correctamente' });
        this.isRegisterMode = false; // Cambiar a login automáticamente
    }

    private login() {
        const users = this.getUsers();
        const user = users.find(u => u.email === this.email && u.password === this.password);

        if (user) {
            // Guardar sesión activa (opcional)
            localStorage.setItem('currentUser', JSON.stringify({ email: user.email }));
            
            this.messageService.add({ severity: 'success', summary: 'Bienvenido', detail: 'Accediendo...' });
            
            // Redirigir al home tras un pequeño delay para que se vea el toast
            setTimeout(() => this.router.navigate(['/']), 1000);
        } else {
            this.showError('Credenciales incorrectas');
        }
    }

    private getUsers(): any[] {
        const data = localStorage.getItem(this.USERS_KEY);
        return data ? JSON.parse(data) : [];
    }

    private showError(msg: string) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
    }
}