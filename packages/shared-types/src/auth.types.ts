import { User } from './user.types';

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requires2FA?: boolean;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
}

export interface TwoFactorVerifyDTO {
  token: string;
}

export interface PasswordResetDTO {
  email: string;
}

export interface PasswordResetConfirmDTO {
  token: string;
  newPassword: string;
}
