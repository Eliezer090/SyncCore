'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { WhatsappLogo as WhatsAppIcon } from '@phosphor-icons/react/dist/ssr/WhatsappLogo';
import { Warning as WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { getAuthHeaders } from '@/lib/auth/client';

interface QRCodeData {
  base64?: string;
  code?: string;
  pairingCode?: string;
}

interface WhatsAppQRDialogProps {
  open: boolean;
  onClose: () => void;
  empresaId: number;
  empresaNome: string;
  onConnected: (phoneNumber: string) => void;
}

type ConnectionStatus = 'idle' | 'loading' | 'waiting_scan' | 'connected' | 'error';

export function WhatsAppQRDialog({
  open,
  onClose,
  empresaId,
  empresaNome,
  onConnected,
}: WhatsAppQRDialogProps): React.JSX.Element {
  const [status, setStatus] = React.useState<ConnectionStatus>('idle');
  const [qrCode, setQrCode] = React.useState<QRCodeData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = React.useState<string | null>(null);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

  // Iniciar conexão
  const startConnection = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    setQrCode(null);

    try {
      const response = await fetch('/api/evolution', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empresa_id: empresaId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar conexão');
      }

      if (data.qrcode?.base64) {
        setQrCode(data.qrcode);
        setStatus('waiting_scan');
        // Iniciar polling para verificar conexão
        startPolling();
      } else {
        throw new Error('QR Code não recebido');
      }
    } catch (err) {
      console.error('[WhatsAppQR] Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setStatus('error');
    }
  }, [empresaId]);

  // Polling para verificar se conectou
  const startPolling = React.useCallback(() => {
    // Limpar polling anterior
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const checkConnection = async () => {
      try {
        const response = await fetch(
          `/api/evolution/qrcode?empresa_id=${empresaId}&action=status`,
          {
            headers: getAuthHeaders(),
          }
        );

        const data = await response.json();

        if (data.connected && data.phoneNumber) {
          // Conectado!
          setPhoneNumber(data.phoneNumber);
          setStatus('connected');
          stopPolling();

          // Confirmar e salvar
          await confirmConnection();
        }
      } catch (err) {
        console.error('[WhatsAppQR] Erro no polling:', err);
      }
    };

    // Verificar a cada 3 segundos
    pollingRef.current = setInterval(checkConnection, 3000);
  }, [empresaId]);

  // Parar polling
  const stopPolling = React.useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Confirmar conexão e salvar número
  const confirmConnection = async () => {
    try {
      const response = await fetch('/api/evolution/qrcode', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empresa_id: empresaId }),
      });

      const data = await response.json();

      if (data.success && data.phoneNumber) {
        setPhoneNumber(data.phoneNumber);
        onConnected(data.phoneNumber);
      }
    } catch (err) {
      console.error('[WhatsAppQR] Erro ao confirmar:', err);
    }
  };

  // Atualizar QR Code (caso expire)
  const refreshQRCode = async () => {
    setStatus('loading');
    
    try {
      const response = await fetch(
        `/api/evolution/qrcode?empresa_id=${empresaId}&action=qrcode`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.connected) {
        setPhoneNumber(data.phoneNumber);
        setStatus('connected');
        onConnected(data.phoneNumber);
      } else if (data.qrcode?.base64) {
        setQrCode(data.qrcode);
        setStatus('waiting_scan');
        startPolling();
      } else {
        throw new Error(data.error || 'Erro ao atualizar QR Code');
      }
    } catch (err) {
      console.error('[WhatsAppQR] Erro ao atualizar:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setStatus('error');
    }
  };

  // Iniciar ao abrir
  React.useEffect(() => {
    if (open && status === 'idle') {
      startConnection();
    }
  }, [open, status, startConnection]);

  // Cleanup ao fechar
  React.useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Reset ao fechar
  const handleClose = () => {
    stopPolling();
    setStatus('idle');
    setQrCode(null);
    setError(null);
    setPhoneNumber(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <WhatsAppIcon size={28} weight="fill" color="#25D366" />
          <Typography variant="h6">Conectar WhatsApp</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ py: 2, alignItems: 'center' }}>
          {/* Loading */}
          {status === 'loading' && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={48} sx={{ color: '#25D366' }} />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Preparando conexão...
              </Typography>
            </Box>
          )}

          {/* QR Code para escanear */}
          {status === 'waiting_scan' && qrCode?.base64 && (
            <>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Escaneie o QR Code com o WhatsApp da empresa
              </Typography>
              
              <Box
                component="img"
                src={qrCode.base64}
                alt="QR Code WhatsApp"
                sx={{
                  width: 280,
                  height: 280,
                  borderRadius: 2,
                  border: '4px solid',
                  borderColor: '#25D366',
                }}
              />

              <Stack spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Abra o WhatsApp no celular → Menu (⋮) → Aparelhos conectados → Conectar
                </Typography>
                
                <Button
                  variant="text"
                  size="small"
                  onClick={refreshQRCode}
                  sx={{ color: '#25D366' }}
                >
                  QR Code expirou? Clique para atualizar
                </Button>
              </Stack>

              <Alert severity="info" sx={{ width: '100%' }}>
                O número do WhatsApp será automaticamente salvo após a conexão.
              </Alert>
            </>
          )}

          {/* Conectado com sucesso */}
          {status === 'connected' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircleIcon size={64} weight="fill" color="#25D366" />
              <Typography variant="h6" sx={{ mt: 2, color: '#25D366' }}>
                WhatsApp Conectado!
              </Typography>
              
              {phoneNumber && (
                <Chip
                  icon={<WhatsAppIcon size={18} />}
                  label={formatPhoneNumber(phoneNumber)}
                  color="success"
                  sx={{ mt: 2 }}
                />
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                O número foi vinculado à empresa <strong>{empresaNome}</strong>
              </Typography>
            </Box>
          )}

          {/* Erro */}
          {status === 'error' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <WarningIcon size={64} color="#f44336" />
              <Typography variant="h6" sx={{ mt: 2 }} color="error">
                Erro na conexão
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {error || 'Não foi possível conectar ao WhatsApp'}
              </Typography>
              <Button
                variant="contained"
                onClick={startConnection}
                sx={{ mt: 2, bgcolor: '#25D366', '&:hover': { bgcolor: '#128C7E' } }}
              >
                Tentar novamente
              </Button>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          {status === 'connected' ? 'Fechar' : 'Cancelar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Formatar número de telefone para exibição
function formatPhoneNumber(phone: string): string {
  // Remove tudo que não for número
  const numbers = phone.replace(/\D/g, '');
  
  // Formato brasileiro: +55 (11) 99999-9999
  if (numbers.length === 13 && numbers.startsWith('55')) {
    return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9)}`;
  }
  
  // Formato brasileiro sem código do país
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  return phone;
}
