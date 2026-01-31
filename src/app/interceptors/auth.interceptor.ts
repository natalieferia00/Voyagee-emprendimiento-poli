import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Obtenemos el token del localStorage
  const token = localStorage.getItem('token');

  // Si existe el token, clonamos la petición y añadimos el header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        'x-auth-token': token
      }
    });
    return next(cloned);
  }

  // Si no hay token, pasamos la petición original
  return next(req);
};