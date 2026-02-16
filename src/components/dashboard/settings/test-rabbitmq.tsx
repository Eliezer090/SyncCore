'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { MessageSquare as RabbitIcon } from '@phosphor-icons/react/dist/ssr/MessageSquare';

interface RabbitStatus {
  configured: boolean;
  url: string | null;
  timestamp: string;
}

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

export function TestRabbitMQ(): React.JSX.Element {
  const [status, setStatus] = React.useState<RabbitStatus | null>(null);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  // Verificar status ao montar
  React.useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/admin/test-rabbitmq');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setChecking(false);
    }
  };

  const sendTestMessage = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/admin/test-rabbitmq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: 1,
          cliente_id: 1
        })
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        avatar={<RabbitIcon fontSize="var(--icon-fontSize-lg)" />}
        subheader="Teste de comunicação com RabbitMQ (remover em produção)"
        title="🐰 Teste RabbitMQ"
      />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          {/* Status */}
          {checking ? (
            <Typography color="text.secondary">Verificando status...</Typography>
          ) : status ? (
            <Alert severity={status.configured ? 'success' : 'warning'}>
              <strong>Status:</strong> {status.configured ? 'Configurado' : 'Não configurado'}
              {status.url && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  URL: {status.url}
                </Typography>
              )}
            </Alert>
          ) : (
            <Alert severity="error">Erro ao verificar status</Alert>
          )}

          {/* Resultado do teste */}
          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'}>
              <strong>{testResult.success ? '✅ Sucesso!' : '❌ Erro!'}</strong>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {testResult.success ? testResult.message : testResult.error}
              </Typography>
              {testResult.data && (
                <Typography variant="caption" component="pre" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(testResult.data, null, 2)}
                </Typography>
              )}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            Clique no botão abaixo para enviar uma mensagem de teste para a fila &quot;atendimento_humano&quot;.
            Verifique os logs do servidor para ver se a mensagem foi recebida pelo consumer.
          </Typography>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button
          variant="outlined"
          onClick={checkStatus}
          disabled={checking}
        >
          Verificar Status
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={sendTestMessage}
          disabled={loading || !status?.configured}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem de Teste'}
        </Button>
      </CardActions>
    </Card>
  );
}
