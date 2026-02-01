import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Location } from '@angular/common';
import {AuthService} from './auth';


export const authForwardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const location = inject(Location);

  if (authService.getIsLoggedIn()) {
    location.back();
    return false;
  }
  return true;
};
