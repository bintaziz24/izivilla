import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() initialMode: 'login' | 'register' | 'verify' = 'register';
  @Input() prefilledEmail = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() authenticated = new EventEmitter<User>();

  mode: 'login' | 'register' | 'verify' = 'register';

  // Register Form Data
  name = '';
  email = '';
  password = '';
  phone = '';
  role: 'user' | 'owner' | 'agency' = 'user';

  // Login Form Data
  loginEmail = '';
  loginPassword = '';

  // OTP Verification Data
  otpDigits: string[] = ['', '', '', '', '', ''];
  pendingEmail = '';
  debugCode: string | null = null;

  // UI state
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Resend Countdown
  resendCountdown = 0;
  private timerInterval: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.mode = this.initialMode;
    if (this.prefilledEmail) {
      this.email = this.prefilledEmail;
      this.pendingEmail = this.prefilledEmail;
      this.loginEmail = this.prefilledEmail;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  switchMode(newMode: 'login' | 'register' | 'verify'): void {
    this.mode = newMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }

  // --- INSCRIPTION ---
  onRegisterSubmit(): void {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      role: this.role
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.pendingEmail = this.email;
        this.debugCode = res.code_debug || null;
        this.successMessage = res.message || 'Inscription réussie ! Veuillez saisir le code reçu par email.';
        this.startResendTimer(60);
        this.mode = 'verify';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Erreur lors de l\'inscription.';
      }
    });
  }

  // --- VÉRIFICATION OTP ---
  onOtpInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Coller un code complet
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = cleanDigits[i] || '';
      }
      const lastFilledIndex = Math.min(cleanDigits.length - 1, 5);
      this.focusInput(lastFilledIndex);
      this.checkAndAutoSubmitOtp();
      return;
    }

    this.otpDigits[index] = value;

    if (value && index < 5) {
      this.focusInput(index + 1);
    }

    this.checkAndAutoSubmitOtp();
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      this.focusInput(index - 1);
    }
  }

  focusInput(index: number): void {
    setTimeout(() => {
      const el = document.getElementById(`otp-input-${index}`);
      if (el) {
        (el as HTMLInputElement).focus();
      }
    }, 10);
  }

  get fullOtpCode(): string {
    return this.otpDigits.join('');
  }

  checkAndAutoSubmitOtp(): void {
    if (this.fullOtpCode.length === 6 && !this.isLoading) {
      this.onVerifySubmit();
    }
  }

  onVerifySubmit(): void {
    const code = this.fullOtpCode;
    if (code.length !== 6) {
      this.errorMessage = 'Veuillez saisir le code complet à 6 chiffres.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyCode(this.pendingEmail, code).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Compte vérifié avec succès !';
        if (res.user) {
          this.authenticated.emit(res.user);
          setTimeout(() => {
            this.closeModal();
          }, 1200);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Code de vérification invalide ou expiré.';
      }
    });
  }

  onResendCode(): void {
    if (this.resendCountdown > 0 || !this.pendingEmail) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendCode(this.pendingEmail).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.debugCode = res.code_debug || null;
        this.successMessage = res.message || 'Un nouveau code a été envoyé à votre adresse email.';
        this.startResendTimer(60);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Impossible d\'envoyer un nouveau code pour le moment.';
      }
    });
  }

  // --- CONNEXION ---
  onLoginSubmit(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Veuillez renseigner votre email et mot de passe.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.user) {
          this.authenticated.emit(res.user);
          this.closeModal();
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.needs_verification) {
          this.pendingEmail = err.email || this.loginEmail;
          this.errorMessage = err.message || 'Veuillez vérifier votre adresse email.';
          this.startResendTimer(30);
          this.mode = 'verify';
        } else {
          this.errorMessage = err.message || 'Identifiants de connexion incorrects.';
        }
      }
    });
  }

  // --- COMPTE À REBOURS ---
  private startResendTimer(seconds: number): void {
    this.stopTimer();
    this.resendCountdown = seconds;
    this.timerInterval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
