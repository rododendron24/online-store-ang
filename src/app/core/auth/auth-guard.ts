import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import {AuthService} from './auth';
import {MatSnackBar} from '@angular/material/snack-bar';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const _snackBar = inject(MatSnackBar);
  const isLoggedIn = authService.getIsLoggedIn();
  if (!isLoggedIn) {
    _snackBar.open('Для доступа в Избранное авторизуйтесь', '', {duration: 3000});
  }
  return isLoggedIn;
}
