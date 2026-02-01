import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgStyle} from '@angular/common';
import {AuthService} from '../../../core/auth/auth';
import {MatSnackBar} from '@angular/material/snack-bar';
import {LoginResponseType} from '../../../../types/login-response.type';
import {DefaultResponseType} from '../../../../types/default-response.type';
import {HttpErrorResponse} from '@angular/common/http';

export interface OnDestroy {
  ngOnDestroy(): void
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgStyle
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService,
              private _snackBar: MatSnackBar, private router: Router) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {

  }

  login(): void {
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password, !!this.loginForm.value.rememberMe)
        .subscribe({
          next: (data: LoginResponseType | DefaultResponseType) => {
          let error = null;
           if ((data as DefaultResponseType).error !== undefined) {
             error = (data as DefaultResponseType).message
           }

           const loginResponse = data as LoginResponseType;
            if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId) {
              error = 'Ошибка авторизации'
            }

            if(error) {
              this._snackBar.open(error, 'Закрыть', {
                duration: 3000,
              });
              throw new Error(error);
            }

            //set tokens and userId
this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken)
            this.authService.userId = loginResponse.userId;


            this._snackBar.open('Успешная авторизация', '', {
              duration: 3000,
            });
            this.router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message, '', {
                duration: 3000,
              });
            } else {
              this._snackBar.open('Ошибка авторизации', '', {
                duration: 3000,
              });
            }
          }
        });
    }
  }
}
