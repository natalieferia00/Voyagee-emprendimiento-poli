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
import { HttpClientModule } from '@angular/common/http';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../service/auth.service'; 

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule, ButtonModule, CheckboxModule, InputTextModule, 
        PasswordModule, FormsModule, RouterModule, RippleModule, 
        AppFloatingConfigurator, ToastModule, HttpClientModule
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
                                    <label for="rememberme1">Recordarme</label>
                                </div>
                                <span (click)="toggleMode()" class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">
                                    {{ isRegisterMode ? '¿Ya tienes cuenta? Login' : '¿No tienes cuenta? Regístrate' }}
                                </span>
                            </div>
                            
                            <p-button 
                                [label]="isRegisterMode ? 'Registrarse' : 'Entrar'" 
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
    private authService = inject(AuthService);

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
        const userData = { email: this.email, password: this.password };
        
        this.authService.register(userData).subscribe({
            next: (res: any) => {
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Éxito', 
                    detail: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.' 
                });
                this.isRegisterMode = false;
            },
            error: (err: any) => {
                const msg = err?.error?.msg || 'Error al conectar con el servidor';
                this.showError(msg);
            }
        });
    }

    private login() {
        const userData = { email: this.email, password: this.password };

        this.authService.login(userData).subscribe({
            next: (res: any) => {
                this.authService.saveToken(res.token);
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Bienvenido', 
                    detail: 'Accediendo a Voyagee...' 
                });
                setTimeout(() => this.router.navigate(['/dashboard']), 1000);
            },
            error: (err: any) => {
                const msg = err?.error?.msg || 'Credenciales incorrectas';
                this.showError(msg);
            }
        });
    }

    private showError(msg: string) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
    }
}