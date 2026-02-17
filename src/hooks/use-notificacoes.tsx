'use client';

import * as React from 'react';
import type { Notificacao } from '@/types/database';
import { getAuthHeaders } from '@/lib/auth/client';

interface NotificacoesState {
  notificacoes: Notificacao[];
  naoLidas: number;
  loading: boolean;
  error: string | null;
  novaNotificacao: Notificacao | null; // Para popup
}

interface NotificacoesContextType extends NotificacoesState {
  fetchNotificacoes: () => Promise<void>;
  marcarComoLida: (id: string) => Promise<void>;
  excluirNotificacao: (id: string) => Promise<void>;
  limparNovaNotificacao: () => void;
}

const NotificacoesContext = React.createContext<NotificacoesContextType | undefined>(undefined);

export function NotificacoesProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, setState] = React.useState<NotificacoesState>({
    notificacoes: [],
    naoLidas: 0,
    loading: true,
    error: null,
    novaNotificacao: null,
  });

  const eventSourceRef = React.useRef<EventSource | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Inicializar áudio
  React.useEffect(() => {
    audioRef.current = new Audio('/assets/notification-sound.mp3');
    audioRef.current.volume = 0.5;
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Tocar som de notificação
  const playNotificationSound = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignorar erro se autoplay bloqueado
      });
    }
  }, []);

  // Buscar notificações da API
  const fetchNotificacoes = React.useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/notificacoes?limit=50', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        notificacoes: data.data || [],
        naoLidas: data.naoLidas || 0,
        loading: false,
      }));
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar notificações',
      }));
    }
  }, []);

  // Marcar como lida
  const marcarComoLida = React.useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ lida: true }),
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          notificacoes: prev.notificacoes.map(n => 
            n.id === id ? { ...n, lida: true } : n
          ),
          naoLidas: Math.max(0, prev.naoLidas - 1),
        }));
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, []);

  // Excluir notificação
  const excluirNotificacao = React.useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setState(prev => {
          const notificacao = prev.notificacoes.find(n => n.id === id);
          const wasUnread = notificacao && !notificacao.lida;
          
          return {
            ...prev,
            notificacoes: prev.notificacoes.filter(n => n.id !== id),
            naoLidas: wasUnread ? Math.max(0, prev.naoLidas - 1) : prev.naoLidas,
          };
        });
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  }, []);

  // Limpar nova notificação (fechar popup)
  const limparNovaNotificacao = React.useCallback(() => {
    setState(prev => ({ ...prev, novaNotificacao: null }));
  }, []);

  // Conectar ao SSE para receber notificações em tempo real
  React.useEffect(() => {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.warn('⚠️ Token não encontrado no localStorage - SSE não será conectado');
      return;
    }

    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isCleanedUp = false;

    const connect = () => {
      if (isCleanedUp) return;

      // Fechar conexão anterior se existir
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log('🔌 Conectando ao stream de notificações...');
      const eventSource = new EventSource(`/api/notificacoes/stream?token=${token}`);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('connected', () => {
        console.log('🔗 Conectado ao stream de notificações');
      });

      eventSource.addEventListener('notificacao', (event) => {
        try {
          const notificacao: Notificacao = JSON.parse(event.data);
          console.log('🔔 Nova notificação recebida:', notificacao);

          // Adicionar à lista e mostrar popup
          setState(prev => ({
            ...prev,
            notificacoes: [notificacao, ...prev.notificacoes],
            naoLidas: prev.naoLidas + 1,
            novaNotificacao: (notificacao.tipo === 'atendimento_humano' || notificacao.tipo === 'mensagem_manual') 
              ? notificacao 
              : prev.novaNotificacao,
          }));

          // Tocar som para atendimento humano e mensagens manuais
          if (notificacao.tipo === 'atendimento_humano' || notificacao.tipo === 'mensagem_manual') {
            playNotificationSound();
          }
        } catch (error) {
          console.error('Erro ao processar notificação:', error);
        }
      });

      eventSource.addEventListener('heartbeat', () => {
        // Heartbeat recebido - conexão ativa
      });

      eventSource.onerror = () => {
        console.error('❌ Erro na conexão SSE - reconectando em 5s...');
        eventSource.close();
        eventSourceRef.current = null;
        // Reconectar após 5 segundos
        if (!isCleanedUp) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    // Cleanup
    return () => {
      isCleanedUp = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [playNotificationSound]);

  // Buscar notificações iniciais
  React.useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  const value = React.useMemo(() => ({
    ...state,
    fetchNotificacoes,
    marcarComoLida,
    excluirNotificacao,
    limparNovaNotificacao,
  }), [state, fetchNotificacoes, marcarComoLida, excluirNotificacao, limparNovaNotificacao]);

  return (
    <NotificacoesContext.Provider value={value}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes(): NotificacoesContextType {
  const context = React.useContext(NotificacoesContext);
  if (context === undefined) {
    throw new Error('useNotificacoes deve ser usado dentro de NotificacoesProvider');
  }
  return context;
}
