'use client';

import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

export interface SignUpParams {
  nome: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    const { nome, email, password } = params;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao cadastrar' };
      }

      // Salvar token e dados do usuário
      localStorage.setItem('custom-auth-token', data.token);
      localStorage.setItem('user-data', JSON.stringify(data.user));

      return {};
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao fazer login' };
      }

      // Salvar token e dados do usuário
      localStorage.setItem('custom-auth-token', data.token);
      localStorage.setItem('user-data', JSON.stringify(data.user));

      return {};
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
    const { email } = params;

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao processar solicitação' };
      }

      return {};
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  async confirmPasswordReset(params: { token: string; newPassword: string }): Promise<{ error?: string }> {
    const { token, newPassword } = params;

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Erro ao redefinir senha' };
      }

      return {};
    } catch (error) {
      console.error('Erro ao confirmar reset de senha:', error);
      return { error: 'Erro ao conectar com o servidor' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    // Tentar obter dados do cache local primeiro
    const cachedUser = localStorage.getItem('user-data');
    if (cachedUser) {
      try {
        return { data: JSON.parse(cachedUser) as User };
      } catch {
        // Se falhar ao parsear, buscar do servidor
      }
    }

    // Buscar dados atualizados do servidor
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token inválido ou expirado
        localStorage.removeItem('custom-auth-token');
        localStorage.removeItem('user-data');
        return { data: null };
      }

      const data = await response.json();
      localStorage.setItem('user-data', JSON.stringify(data.user));
      return { data: data.user };
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      // Em caso de erro de rede, usar cache se disponível
      if (cachedUser) {
        return { data: JSON.parse(cachedUser) as User };
      }
      return { data: null };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user-data');

    return {};
  }
}

export const authClient = new AuthClient();

/**
 * Helper para fazer requisições autenticadas
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('custom-auth-token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Obtém o token de autenticação atual
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('custom-auth-token');
}

/**
 * Retorna headers de autenticação para uso em requisições
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('custom-auth-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
