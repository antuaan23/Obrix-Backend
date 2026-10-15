export interface AuthPayload {
    access_token: string;
  }

export interface ResetPayload {
    email: string;
}

export interface PasswordChangedResponse {
    email: string;
    actualizadoAt: Date;
  }

  export interface PasswordChangedPayload {
    email: string;
  }