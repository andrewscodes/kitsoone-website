import {
  Injectable,
  signal,
  computed,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  signUp,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signOut,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';

export interface AuthUser {
  userId: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentUser = signal<AuthUser | null>(null);

  public readonly user = this.currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCurrentUser();
    }
  }

  public async loadCurrentUser(): Promise<void> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const email =
        (session.tokens?.idToken?.payload?.['email'] as string) ?? '';
      this.currentUser.set({ userId: user.userId, email });
    } catch {
      this.currentUser.set(null);
    }
  }

  public async signUp(email: string, password: string): Promise<string> {
    const { userId } = await signUp({
      username: email,
      password,
      options: { userAttributes: { email } },
    });
    return userId ?? '';
  }

  public async confirmSignUp(email: string, code: string): Promise<void> {
    await confirmSignUp({ username: email, confirmationCode: code });
  }

  public async resendSignUp(email: string): Promise<void> {
    await resendSignUpCode({ username: email });
  }

  public async signIn(email: string, password: string): Promise<void> {
    const result = await signIn({ username: email, password });

    // Amplify resolves (rather than throws) for these cases, returning isSignedIn: false instead.
    if (!result.isSignedIn) {
      const error = new Error('Sign in did not complete.');
      error.name =
        result.nextStep.signInStep === 'CONFIRM_SIGN_UP'
          ? 'UserNotConfirmedException'
          : result.nextStep.signInStep === 'RESET_PASSWORD'
            ? 'PasswordResetRequiredException'
            : 'NotAuthorizedException';
      throw error;
    }

    await this.loadCurrentUser();
  }

  public async signOut(): Promise<void> {
    await signOut();
    this.currentUser.set(null);
  }

  public async forgotPassword(email: string): Promise<void> {
    await resetPassword({ username: email });
  }

  public async confirmResetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
  }

  public async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() ?? null;
    } catch {
      return null;
    }
  }
}
