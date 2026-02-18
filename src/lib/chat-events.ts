import { EventEmitter } from 'events';
import type { MensagemChat, ChatContato } from '@/types/database';

export interface ChatEvent {
  type: 'nova_mensagem' | 'contato_atualizado';
  mensagem?: MensagemChat;
  contato?: ChatContato;
}

// Event Emitter global para eventos de chat em tempo real
class ChatEventEmitter extends EventEmitter {
  private static instance: ChatEventEmitter;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  static getInstance(): ChatEventEmitter {
    if (!ChatEventEmitter.instance) {
      ChatEventEmitter.instance = new ChatEventEmitter();
    }
    return ChatEventEmitter.instance;
  }

  // Emitir nova mensagem para uma empresa
  emitNovaMensagem(empresaId: number, mensagem: MensagemChat): void {
    const event: ChatEvent = { type: 'nova_mensagem', mensagem };
    this.emit(`chat:${empresaId}`, event);
  }

  // Emitir atualização de contato
  emitContatoAtualizado(empresaId: number, contato: ChatContato): void {
    const event: ChatEvent = { type: 'contato_atualizado', contato };
    this.emit(`chat:${empresaId}`, event);
  }

  // Escutar eventos de chat de uma empresa
  onChatEvent(empresaId: number, callback: (event: ChatEvent) => void): void {
    this.on(`chat:${empresaId}`, callback);
  }

  // Parar de escutar
  offChatEvent(empresaId: number, callback: (event: ChatEvent) => void): void {
    this.off(`chat:${empresaId}`, callback);
  }
}

export const chatEmitter = ChatEventEmitter.getInstance();
