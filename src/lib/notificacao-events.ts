import { EventEmitter } from 'events';
import type { Notificacao } from '@/types/database';

// Event Emitter global para notificações
class NotificacaoEventEmitter extends EventEmitter {
  private static instance: NotificacaoEventEmitter;

  private constructor() {
    super();
    this.setMaxListeners(100); // Permitir múltiplas conexões SSE
  }

  static getInstance(): NotificacaoEventEmitter {
    if (!NotificacaoEventEmitter.instance) {
      NotificacaoEventEmitter.instance = new NotificacaoEventEmitter();
    }
    return NotificacaoEventEmitter.instance;
  }

  // Emitir nova notificação para uma empresa específica
  emitNovaNotificacao(empresaId: number, notificacao: Notificacao): void {
    this.emit(`notificacao:${empresaId}`, notificacao);
    this.emit('notificacao:all', notificacao); // Para admin global
  }

  // Escutar notificações de uma empresa
  onNovaNotificacao(empresaId: number | 'all', callback: (notificacao: Notificacao) => void): void {
    this.on(`notificacao:${empresaId}`, callback);
  }

  // Parar de escutar
  offNovaNotificacao(empresaId: number | 'all', callback: (notificacao: Notificacao) => void): void {
    this.off(`notificacao:${empresaId}`, callback);
  }
}

export const notificacaoEmitter = NotificacaoEventEmitter.getInstance();
